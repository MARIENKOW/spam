import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { TgClientManagerService } from "@/modules/tg-client-manager/tg-client-manager.service";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";
import { Api } from "telegram/tl";
import {
    MessengerAccountDialogsDto,
    MessengerDialogDto,
    MessengerDialogType,
    MessengerMessageDto,
} from "@myorg/shared/dto";

@Injectable()
export class TgMessengerService {
    constructor(
        private readonly manager: TgClientManagerService,
        private readonly prisma: PrismaService,
    ) {}

    async getDialogs(adminId: string): Promise<MessengerAccountDialogsDto[]> {
        const entries = this.manager.getClientsByAdminId(adminId);

        const results = await Promise.allSettled(
            entries.map(async ({ accountId, client, accountName }) => {
                const dialogs = await client.getDialogs({ limit: 50 });

                const mapped: MessengerDialogDto[] = dialogs.map((d) => {
                    const entity = d.entity;
                    let type: MessengerDialogType = "user";
                    if (entity instanceof Api.Chat || entity instanceof Api.ChatForbidden) type = "group";
                    if (entity instanceof Api.Channel) {
                        type = (entity as Api.Channel).broadcast ? "channel" : "group";
                    }

                    const lastMsg = d.message;
                    const lastText =
                        lastMsg && "message" in lastMsg && typeof lastMsg.message === "string"
                            ? lastMsg.message
                            : null;
                    const lastDate =
                        lastMsg && "date" in lastMsg && typeof lastMsg.date === "number"
                            ? new Date(lastMsg.date * 1000).toISOString()
                            : null;

                    return {
                        id: d.id?.toString() ?? "",
                        name: d.title ?? "",
                        type,
                        unreadCount: d.unreadCount ?? 0,
                        lastMessage: lastText,
                        lastMessageDate: lastDate,
                        photoBase64: null,
                    };
                });

                const result: MessengerAccountDialogsDto = { accountId, accountName, dialogs: mapped };
                return result;
            }),
        );

        return results
            .filter((r): r is PromiseFulfilledResult<MessengerAccountDialogsDto> => r.status === "fulfilled")
            .map((r) => r.value);
    }

    async getMessages(
        accountId: string,
        dialogId: string,
        adminId: string,
        limit: number,
        offsetId: number,
    ): Promise<MessengerMessageDto[]> {
        await this.assertOwnership(accountId, adminId);

        const client = this.manager.getClient(accountId);
        if (!client) throw new NotFoundException("tgMessenger.clientNotFound");

        const peer = await client.getInputEntity(dialogId).catch(() => null);
        if (!peer) throw new NotFoundException("tgMessenger.dialogNotFound");

        const messages = await client.getMessages(peer, {
            limit,
            offsetId: offsetId || undefined,
        });

        return messages.map((msg) => ({
            id: msg.id,
            text: "message" in msg ? (msg.message as string) ?? "" : "",
            date: "date" in msg ? new Date((msg.date as number) * 1000).toISOString() : new Date().toISOString(),
            fromMe: "out" in msg ? !!(msg.out) : false,
            fromName: null,
        }));
    }

    async sendMessage(
        accountId: string,
        dialogId: string,
        text: string,
        adminId: string,
    ): Promise<void> {
        await this.assertOwnership(accountId, adminId);

        const client = this.manager.getClient(accountId);
        if (!client) throw new NotFoundException("tgMessenger.clientNotFound");

        const peer = await client.getInputEntity(dialogId);
        await client.sendMessage(peer, { message: text });
    }

    private async assertOwnership(accountId: string, adminId: string): Promise<void> {
        const account = await this.prisma.tgAccount.findUnique({
            where: { id: accountId },
            select: { adminId: true },
        });
        if (!account) throw new NotFoundException("tgAccount.notFound");
        if (account.adminId !== adminId) throw new ForbiddenException("tgAccount.notAllowed");
    }
}
