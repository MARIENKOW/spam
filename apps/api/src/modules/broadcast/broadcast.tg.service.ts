import { Injectable, Logger } from "@nestjs/common";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { Api } from "telegram/tl";
import bigInt from "big-integer";
import { env } from "@/config";
import { ChannelSearchResultDto } from "@myorg/shared/dto";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";
import { BroadcastService } from "@/modules/broadcast/broadcast.service";

@Injectable()
export class BroadcastTgService {
    private readonly logger = new Logger(BroadcastTgService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly broadcastService: BroadcastService,
    ) {}

    // ── Channel search ────────────────────────────────────────────────────────

    async searchChannels(
        tgAccountId: string,
        query: string,
    ): Promise<ChannelSearchResultDto[]> {
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
                    // photo download is optional — continue without it
                }

                channels.push({
                    telegramId: chat.id.toString(),
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
        broadcastId: string,
        channelId: string,
        telegramChannelId: string,
    ): Promise<number> {
        const client = await this.createClient(tgAccountId);

        try {
            const channelPeer = await client.getInputEntity(
                telegramChannelId.startsWith("-")
                    ? telegramChannelId
                    : `-100${telegramChannelId}`,
            );

            const recipients: Array<{
                userId: string;
                accessHash: string | null;
                username: string | null;
                firstName: string | null;
                lastName: string | null;
            }> = [];

            let offset = "";
            const limit = 100;

            while (true) {
                const result = await client.invoke(
                    new Api.payments.GetSavedStarGifts({
                        peer: channelPeer,
                        offset,
                        limit,
                    }),
                );

                for (const gift of result.gifts) {
                    // Skip anonymous gifts
                    if (gift.nameHidden || !gift.fromId) continue;

                    if (!(gift.fromId instanceof Api.PeerUser)) continue;

                    const userId = gift.fromId.userId.toString();

                    // Find user info from the users array in the response
                    const userInfo = result.users.find(
                        (u): u is Api.User =>
                            u instanceof Api.User &&
                            u.id.toString() === userId,
                    );

                    recipients.push({
                        userId,
                        accessHash: userInfo?.accessHash?.toString() ?? null,
                        username: userInfo?.username ?? null,
                        firstName: userInfo?.firstName ?? null,
                        lastName: userInfo?.lastName ?? null,
                    });
                }

                if (!result.nextOffset) break;
                offset = result.nextOffset;
            }

            // Upsert recipients into the broadcast (deduplication by userId)
            await this.broadcastService.upsertRecipients(broadcastId, recipients);
            await this.broadcastService.updateChannelRecipientCount(channelId, recipients.length);

            return recipients.length;
        } catch (err: any) {
            this.logger.warn(
                `Failed to fetch star gifts from channel ${telegramChannelId}: ${err.message}`,
            );
            throw err;
        } finally {
            await client.disconnect();
        }
    }

    // ── Send message ──────────────────────────────────────────────────────────

    async sendMessage(
        tgAccountId: string,
        userId: string,
        accessHash: string | null,
        message: string,
    ): Promise<void> {
        const client = await this.createClient(tgAccountId);

        try {
            const peer = accessHash
                ? new Api.InputPeerUser({
                      userId: bigInt(userId),
                      accessHash: bigInt(accessHash),
                  })
                : userId;

            await client.sendMessage(peer as any, { message });
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
