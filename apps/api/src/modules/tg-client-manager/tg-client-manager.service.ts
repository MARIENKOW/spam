import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { NewMessage, NewMessageEvent } from "telegram/events";
import { Api } from "telegram/tl";
import { env } from "@/config";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";
import { EventEmitter } from "events";
import { MessengerNewMessageEvent } from "@myorg/shared/dto";

type ClientEntry = {
    client: TelegramClient;
    adminId: string;
    accountName: string;
};

@Injectable()
export class TgClientManagerService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(TgClientManagerService.name);
    private readonly clients = new Map<string, ClientEntry>();
    readonly events = new EventEmitter();

    constructor(private readonly prisma: PrismaService) {}

    async onModuleInit(): Promise<void> {
        try {
            const accounts = await this.prisma.tgAccount.findMany({
                select: { id: true, sessionString: true, adminId: true, firstName: true, lastName: true, username: true },
            });

            for (const a of accounts) {
                await this.startClient(
                    a.id,
                    a.sessionString,
                    a.adminId,
                    this.buildName(a.firstName, a.lastName, a.username),
                );
                if (accounts.length > 1) await new Promise((r) => setTimeout(r, 1500));
            }

            this.logger.log(`Started ${this.clients.size}/${accounts.length} Telegram clients`);
        } catch (err: any) {
            this.logger.error(`Failed to initialize Telegram clients: ${err.message}`);
        }
    }

    async onModuleDestroy(): Promise<void> {
        await Promise.allSettled(
            Array.from(this.clients.values()).map(({ client }) => client.disconnect()),
        );
        this.clients.clear();
    }

    async addClient(
        accountId: string,
        sessionString: string,
        adminId: string,
        firstName: string,
        lastName: string | null,
        username: string | null,
    ): Promise<void> {
        await this.startClient(accountId, sessionString, adminId, this.buildName(firstName, lastName, username));
    }

    async removeClient(accountId: string): Promise<void> {
        const entry = this.clients.get(accountId);
        if (!entry) return;
        try {
            await entry.client.invoke(new Api.auth.LogOut());
        } catch {
            // игнорируем — сессия могла уже истечь
        }
        await entry.client.disconnect().catch(() => {});
        this.clients.delete(accountId);
    }

    getClient(accountId: string): TelegramClient | undefined {
        return this.clients.get(accountId)?.client;
    }

    getClientsByAdminId(adminId: string): Array<{ accountId: string; client: TelegramClient; accountName: string }> {
        return Array.from(this.clients.entries())
            .filter(([, v]) => v.adminId === adminId)
            .map(([accountId, { client, accountName }]) => ({ accountId, client, accountName }));
    }

    private async startClient(
        accountId: string,
        sessionString: string,
        adminId: string,
        accountName: string,
    ): Promise<void> {
        try {
            const client = new TelegramClient(
                new StringSession(sessionString),
                env.TELEGRAM_API_ID,
                env.TELEGRAM_API_HASH,
                { connectionRetries: 5, autoReconnect: true },
            );

            await client.connect();

            // Проверяем что сессия действительно авторизована
            const me = await client.getMe();
            if (!me) {
                await client.disconnect().catch(() => {});
                this.logger.warn(`Session expired for account ${accountName} (${accountId}), marking inactive`);
                await this.prisma.tgAccount.update({ where: { id: accountId }, data: { status: "INACTIVE" } }).catch(() => {});
                return;
            }

            this.logger.log(`Client connected: ${accountName} (${accountId})`);

            client.addEventHandler(
                (event: NewMessageEvent) => this.handleNewMessage(event, accountId, adminId, accountName),
                new NewMessage({}),
            );

            this.clients.set(accountId, { client, adminId, accountName });
        } catch (err: any) {
            this.logger.warn(`Failed to start client for account ${accountId}: ${err.message}`);
        }
    }

    private handleNewMessage(
        event: NewMessageEvent,
        accountId: string,
        adminId: string,
        accountName: string,
    ): void {
        try {
            const msg = event.message;
            if (!msg.text) return;

            const peerId = msg.peerId;
            let dialogId: string;

            if ((peerId as any)?.userId) dialogId = (peerId as any).userId.toString();
            else if ((peerId as any)?.chatId) dialogId = `-${(peerId as any).chatId.toString()}`;
            else if ((peerId as any)?.channelId) dialogId = `-100${(peerId as any).channelId.toString()}`;
            else return;

            const payload: MessengerNewMessageEvent = {
                accountId,
                accountName,
                dialogId,
                message: {
                    id: msg.id,
                    text: msg.text,
                    date: new Date(msg.date * 1000).toISOString(),
                    fromMe: msg.out ?? false,
                    fromName: null,
                },
            };

            this.events.emit("message.new", adminId, payload);
        } catch (err: any) {
            this.logger.warn(`Error handling new message for account ${accountId}: ${err.message}`);
        }
    }

    private buildName(firstName: string, lastName: string | null, username: string | null): string {
        if (firstName || lastName) return [firstName, lastName].filter(Boolean).join(" ");
        return username ?? "Unknown";
    }
}
