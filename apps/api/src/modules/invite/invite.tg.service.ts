import { Injectable, Logger } from "@nestjs/common";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { Api } from "telegram/tl";
import bigInt from "big-integer";
import { env } from "@/config";
import { ChannelSearchResultDto } from "@myorg/shared/dto";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";
import { InviteService } from "@/modules/invite/invite.service";

@Injectable()
export class InviteTgService {
    private readonly logger = new Logger(InviteTgService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly inviteService: InviteService,
    ) {}

    // ── Channel search ────────────────────────────────────────────────────────

    async searchChannels(tgAccountId: string, query: string): Promise<ChannelSearchResultDto[]> {
        const client = await this.createClient(tgAccountId);

        try {
            const result = await client.invoke(
                new Api.contacts.Search({ q: query, limit: 20 }),
            );

            const channels: ChannelSearchResultDto[] = [];

            for (const chat of result.chats) {
                if (!(chat instanceof Api.Channel)) continue;
                if (chat.broadcast !== true) continue;

                let photoBase64: string | null = null;
                try {
                    const buffer = await client.downloadProfilePhoto(chat, { isBig: false });
                    if (buffer && (buffer as Buffer).length > 0) {
                        photoBase64 = (buffer as Buffer).toString("base64");
                    }
                } catch {
                    // optional
                }

                channels.push({
                    telegramId: chat.id.toString(),
                    accessHash: chat.accessHash?.toString() ?? null,
                    username: chat.username ?? null,
                    title: chat.title,
                    photoBase64,
                    memberCount: chat.participantsCount ?? null,
                });
            }

            return channels;
        } finally {
            await client.disconnect();
        }
    }

    // ── Fetch gift senders from channel ───────────────────────────────────────

    async fetchChannelRecipients(
        tgAccountId: string,
        inviteId: string,
        channelId: string,
        telegramChannelId: string,
    ): Promise<number> {
        await this.prisma.inviteChannel.update({
            where: { id: channelId },
            data: { fetchError: null },
        });

        const client = await this.createClient(tgAccountId);

        try {
            const channel = await this.prisma.inviteChannel.findUnique({ where: { id: channelId } });
            const channelPeer = new Api.InputChannel({
                channelId: bigInt(telegramChannelId),
                accessHash: bigInt(channel?.accessHash ?? "0"),
            });

            const recipients: Array<{
                userId: string;
                accessHash: string | null;
                username: string | null;
                firstName: string | null;
                lastName: string | null;
            }> = [];

            let offset = "";
            const limit = 100;
            const seenUserIds = new Set<string>();
            let totalGifts = 0;

            while (true) {
                const result = await client.invoke(
                    new Api.payments.GetSavedStarGifts({ peer: channelPeer, offset, limit }),
                );

                for (const gift of result.gifts) {
                    if (gift.nameHidden || !gift.fromId) continue;
                    if (!(gift.fromId instanceof Api.PeerUser)) continue;

                    totalGifts++;
                    const userId = gift.fromId.userId.toString();

                    if (!seenUserIds.has(userId)) {
                        seenUserIds.add(userId);

                        const userInfo = result.users.find(
                            (u): u is Api.User =>
                                u instanceof Api.User && u.id.toString() === userId,
                        );

                        recipients.push({
                            userId,
                            accessHash: userInfo?.accessHash?.toString() ?? null,
                            username: userInfo?.username ?? null,
                            firstName: userInfo?.firstName ?? null,
                            lastName: userInfo?.lastName ?? null,
                        });
                    }
                }

                if (!result.nextOffset) break;
                offset = result.nextOffset;
            }

            await this.inviteService.upsertRecipients(inviteId, recipients);
            await this.inviteService.updateChannelRecipientCount(channelId, recipients.length, totalGifts);

            return recipients.length;
        } catch (err: any) {
            this.logger.warn(`Failed to fetch star gifts from channel ${telegramChannelId}: ${err.message}`);
            throw err;
        } finally {
            await client.disconnect();
        }
    }

    // ── Invite to channel ─────────────────────────────────────────────────────

    async inviteToChannel(
        tgAccountId: string,
        channelTelegramId: string,
        channelAccessHash: string,
        userId: string,
        userAccessHash: string | null,
    ): Promise<void> {
        const client = await this.createClient(tgAccountId);

        try {
            const channel = new Api.InputChannel({
                channelId: bigInt(channelTelegramId),
                accessHash: bigInt(channelAccessHash),
            });

            let inputUser = userAccessHash
                ? new Api.InputUser({ userId: bigInt(userId), accessHash: bigInt(userAccessHash) })
                : new Api.InputUser({ userId: bigInt(userId), accessHash: bigInt(0) });

            let inviteResult: any;
            try {
                inviteResult = await client.invoke(
                    new Api.channels.InviteToChannel({ channel, users: [inputUser] }),
                );
            } catch (err: any) {
                if (err.errorMessage !== "USER_ID_INVALID") throw err;

                // accessHash is stale — re-resolve the user and retry once
                const resolved = await client.invoke(
                    new Api.users.GetUsers({
                        id: [new Api.InputUser({ userId: bigInt(userId), accessHash: bigInt(userAccessHash ?? "0") })],
                    }),
                );
                const fresh = resolved[0];
                if (!(fresh instanceof Api.User) || !fresh.accessHash) throw err;

                inputUser = new Api.InputUser({ userId: fresh.id, accessHash: fresh.accessHash });
                inviteResult = await client.invoke(
                    new Api.channels.InviteToChannel({ channel, users: [inputUser] }),
                );
            }

            // missingInvitees is Telegram's authoritative signal: it lists the users that
            // could NOT be added (privacy settings, join-request channels, etc.). If it's
            // empty, the invite succeeded — we trust it and skip any further verification.
            const missingInvitees = inviteResult?.missingInvitees as Array<{ userId: { toString(): string } }> | undefined;
            if (missingInvitees && missingInvitees.length > 0) {
                const err = new Error("User privacy prevents adding to channel");
                Object.assign(err, { errorMessage: "USER_PRIVACY_RESTRICTED" });
                throw err;
            }
        } finally {
            await client.disconnect();
        }
    }

    // ── Private ───────────────────────────────────────────────────────────────

    private async createClient(tgAccountId: string): Promise<TelegramClient> {
        const account = await this.prisma.tgAccount.findUnique({
            where: { id: tgAccountId },
            select: { sessionString: true },
        });
        if (!account) throw new Error(`TgAccount ${tgAccountId} not found`);

        const client = new TelegramClient(
            new StringSession(account.sessionString),
            env.TELEGRAM_API_ID,
            env.TELEGRAM_API_HASH,
            { connectionRetries: 3 },
        );
        await client.connect();
        return client;
    }
}
