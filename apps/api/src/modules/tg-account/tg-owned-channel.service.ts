import {
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { Api } from "telegram/tl";
import { env } from "@/config";
import { TgOwnedChannelDto } from "@myorg/shared/dto";
import { RoleAdmin } from "@/generated/prisma";

@Injectable()
export class TgOwnedChannelService {
    private readonly logger = new Logger(TgOwnedChannelService.name);

    constructor(private readonly prisma: PrismaService) {}

    async getChannels(tgAccountId: string, adminId: string, role: RoleAdmin): Promise<TgOwnedChannelDto[]> {
        await this.assertAccess(tgAccountId, adminId, role);

        const channels = await this.prisma.tgOwnedChannel.findMany({
            where: { tgAccountId },
            orderBy: { title: "asc" },
        });

        return channels.map((c) => ({
            id: c.id,
            telegramId: c.telegramId,
            accessHash: c.accessHash,
            title: c.title,
            username: c.username,
            url: c.username ? `https://t.me/${c.username}` : `https://t.me/c/${c.telegramId}/1`,
            photoBase64: c.photoBase64,
            memberCount: c.memberCount,
            updatedAt: c.updatedAt.toISOString(),
        }));
    }

    async syncChannels(tgAccountId: string, adminId: string, role: RoleAdmin): Promise<TgOwnedChannelDto[]> {
        await this.assertAccess(tgAccountId, adminId, role);

        const account = await this.prisma.tgAccount.findUnique({
            where: { id: tgAccountId },
            select: { sessionString: true },
        });
        if (!account) throw new NotFoundException("tgAccount.notFound");

        const client = new TelegramClient(
            new StringSession(account.sessionString),
            env.TELEGRAM_API_ID,
            env.TELEGRAM_API_HASH,
            { connectionRetries: 3 },
        );
        await client.connect();

        try {
            const dialogs = await client.getDialogs({ archived: false, limit: 200 });

            const ownedChannels: Array<{
                telegramId: string;
                accessHash: string;
                title: string;
                username: string | null;
                photoBase64: string | null;
                memberCount: number | null;
            }> = [];

            for (const dialog of dialogs) {
                const entity = dialog.entity;
                if (!(entity instanceof Api.Channel)) continue;
                if (!entity.broadcast) continue;

                const isOwner =
                    entity.creator === true ||
                    (entity.adminRights != null && entity.adminRights.inviteUsers === true);
                if (!isOwner) continue;

                if (!entity.accessHash) continue;

                let photoBase64: string | null = null;
                try {
                    const buf = await client.downloadProfilePhoto(entity, { isBig: false });
                    if (buf && (buf as Buffer).length > 0) {
                        photoBase64 = (buf as Buffer).toString("base64");
                    }
                } catch {
                    // photo is optional
                }

                ownedChannels.push({
                    telegramId: entity.id.toString(),
                    accessHash: entity.accessHash.toString(),
                    title: entity.title,
                    username: entity.username ?? null,
                    photoBase64,
                    memberCount: entity.participantsCount ?? null,
                });
            }

            // Upsert all found channels
            for (const ch of ownedChannels) {
                await this.prisma.tgOwnedChannel.upsert({
                    where: { tgAccountId_telegramId: { tgAccountId, telegramId: ch.telegramId } },
                    create: { tgAccountId, ...ch },
                    update: {
                        accessHash: ch.accessHash,
                        title: ch.title,
                        username: ch.username,
                        photoBase64: ch.photoBase64,
                        memberCount: ch.memberCount,
                    },
                });
            }

            // Remove channels no longer present
            const foundIds = ownedChannels.map((c) => c.telegramId);
            await this.prisma.tgOwnedChannel.deleteMany({
                where: { tgAccountId, telegramId: { notIn: foundIds } },
            });

            this.logger.log(`Synced ${ownedChannels.length} owned channels for account ${tgAccountId}`);
        } finally {
            await client.disconnect();
        }

        return this.getChannels(tgAccountId, adminId, role);
    }

    private async assertAccess(tgAccountId: string, adminId: string, role: RoleAdmin): Promise<void> {
        if (role === "SUPERADMIN") return;
        const account = await this.prisma.tgAccount.findUnique({
            where: { id: tgAccountId },
            select: { adminId: true },
        });
        if (!account) throw new NotFoundException("tgAccount.notFound");
        if (account.adminId !== adminId) throw new ForbiddenException("tgAccount.notAllowed");
    }
}
