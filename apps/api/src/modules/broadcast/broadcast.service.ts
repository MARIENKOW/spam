import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";
import {
    BroadcastDto,
    BroadcastProgressDto,
    BroadcastRecipientDto,
    BroadcastRunDto,
    BroadcastRunRecipientDto,
    PagedResult,
} from "@myorg/shared/dto";
import {
    AddBroadcastChannelOutput,
} from "@myorg/shared/form";
import {
    mapBroadcast,
    mapBroadcastChannel,
    mapBroadcastProgress,
    mapBroadcastRecipient,
    mapBroadcastRun,
    mapBroadcastRunRecipient,
} from "@/modules/broadcast/broadcast.mapper";
import { BroadcastStatus, RecipientStatus, RoleAdmin } from "@/generated/prisma";

@Injectable()
export class BroadcastService {
    private readonly logger = new Logger(BroadcastService.name);

    constructor(private readonly prisma: PrismaService) {}

    // ── Get or create ─────────────────────────────────────────────────────────

    async getOrCreate(tgAccountId: string): Promise<BroadcastDto> {
        let broadcast = await this.prisma.broadcast.findUnique({
            where: { tgAccountId },
            include: { channels: true, runs: { orderBy: { finishedAt: "desc" } } },
        });

        if (!broadcast) {
            broadcast = await this.prisma.broadcast.create({
                data: { tgAccountId },
                include: { channels: true, runs: true },
            });
        }

        const counts = await this.getRecipientCounts(broadcast.id);
        return mapBroadcast(
            broadcast,
            broadcast.channels,
            broadcast.runs,
            counts.pending,
            counts.sent,
            counts.failed,
        );
    }

    // ── Message ───────────────────────────────────────────────────────────────

    async updateMessage(tgAccountId: string, message: string): Promise<BroadcastDto> {
        const broadcast = await this.findByAccountOrFail(tgAccountId);
        this.assertEditable(broadcast.status);

        const updated = await this.prisma.broadcast.update({
            where: { id: broadcast.id },
            data: { message },
            include: { channels: true, runs: { orderBy: { finishedAt: "desc" } } },
        });

        const counts = await this.getRecipientCounts(updated.id);
        return mapBroadcast(updated, updated.channels, updated.runs, counts.pending, counts.sent, counts.failed);
    }

    // ── Channels ──────────────────────────────────────────────────────────────

    async addChannel(tgAccountId: string, data: AddBroadcastChannelOutput): Promise<BroadcastDto> {
        const broadcast = await this.findByAccountOrFail(tgAccountId);
        this.assertEditable(broadcast.status);

        const existing = await this.prisma.broadcastChannel.findUnique({
            where: { broadcastId_telegramId: { broadcastId: broadcast.id, telegramId: data.telegramId } },
        });
        if (existing) return this.getOrCreate(tgAccountId);

        await this.prisma.broadcastChannel.create({
            data: {
                broadcastId: broadcast.id,
                telegramId: data.telegramId,
                username: data.username,
                title: data.title,
                photoUrl: data.photoBase64 ? `data:image/jpeg;base64,${data.photoBase64}` : null,
                memberCount: data.memberCount,
                recipientCount: null,
            },
        });

        return this.getOrCreate(tgAccountId);
    }

    async removeChannel(tgAccountId: string, channelId: string): Promise<BroadcastDto> {
        const broadcast = await this.findByAccountOrFail(tgAccountId);
        this.assertEditable(broadcast.status);

        const channel = await this.prisma.broadcastChannel.findFirst({
            where: { id: channelId, broadcastId: broadcast.id },
        });
        if (!channel) throw new NotFoundException("channel.notFound");

        await this.prisma.$transaction([
            this.prisma.broadcastRecipient.deleteMany({
                where: {
                    broadcastId: broadcast.id,
                    // Only delete recipients that came exclusively from this channel
                    // We can't track per-channel recipient origin, so we remove all and re-fetch from remaining
                    // This is handled by re-fetching after deletion — see note below
                },
            }),
            this.prisma.broadcastChannel.delete({ where: { id: channelId } }),
        ]);

        return this.getOrCreate(tgAccountId);
    }

    // ── Recipients count ──────────────────────────────────────────────────────

    async getProgress(tgAccountId: string): Promise<BroadcastProgressDto> {
        const broadcast = await this.prisma.broadcast.findUnique({
            where: { tgAccountId },
            include: { channels: true },
        });
        if (!broadcast) throw new NotFoundException("broadcast.notFound");

        const counts = await this.getRecipientCounts(broadcast.id);
        return mapBroadcastProgress(
            broadcast,
            broadcast.channels,
            counts.pending,
            counts.sent,
            counts.failed,
        );
    }

    async getRecipients(
        tgAccountId: string,
        page: number,
        limit: number,
        status?: string,
    ): Promise<PagedResult<BroadcastRecipientDto>> {
        const broadcast = await this.findByAccountOrFail(tgAccountId);

        const statusFilter =
            status === "PROCESSED"
                ? { status: { in: ["SENT" as RecipientStatus, "FAILED" as RecipientStatus] } }
                : status
                ? { status: status as RecipientStatus }
                : {};

        const where = { broadcastId: broadcast.id, ...statusFilter };

        const [data, total] = await this.prisma.$transaction([
            this.prisma.broadcastRecipient.findMany({
                where,
                orderBy: [{ sentAt: { sort: "desc", nulls: "last" } }, { id: "asc" }],
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.broadcastRecipient.count({ where }),
        ]);

        return {
            data: data.map(mapBroadcastRecipient),
            meta: { page, limit, total, pageCount: Math.ceil(total / limit) },
        };
    }

    async getHistory(tgAccountId: string): Promise<BroadcastRunDto[]> {
        const broadcast = await this.findByAccountOrFail(tgAccountId);
        const runs = await this.prisma.broadcastRun.findMany({
            where: { broadcastId: broadcast.id },
            orderBy: { finishedAt: "desc" },
        });
        return runs.map(mapBroadcastRun);
    }

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    async start(tgAccountId: string): Promise<BroadcastDto> {
        const broadcast = await this.prisma.broadcast.findUnique({
            where: { tgAccountId },
            include: { channels: true },
        });
        if (!broadcast) throw new NotFoundException("broadcast.notFound");

        if (broadcast.status !== "DRAFT" && broadcast.status !== "COMPLETED" && broadcast.status !== "STOPPED") {
            throw new BadRequestException("broadcast.alreadyRunning");
        }

        if (!broadcast.message.trim()) {
            throw new BadRequestException("broadcast.noMessage");
        }

        if (broadcast.channels.length === 0) {
            throw new BadRequestException("broadcast.noChannels");
        }

        const pendingCount = await this.prisma.broadcastRecipient.count({
            where: { broadcastId: broadcast.id, status: "PENDING" },
        });
        if (pendingCount === 0) {
            throw new BadRequestException("broadcast.noRecipients");
        }

        const updated = await this.prisma.broadcast.update({
            where: { id: broadcast.id },
            data: { status: "RUNNING", startedAt: new Date(), completedAt: null },
            include: { channels: true, runs: { orderBy: { finishedAt: "desc" } } },
        });

        const counts = await this.getRecipientCounts(updated.id);
        return mapBroadcast(updated, updated.channels, updated.runs, counts.pending, counts.sent, counts.failed);
    }

    async stop(tgAccountId: string): Promise<BroadcastDto> {
        const broadcast = await this.findByAccountOrFail(tgAccountId);

        if (broadcast.status !== "RUNNING") {
            throw new BadRequestException("broadcast.notRunning");
        }

        await this.archiveCurrentRun(broadcast.id, "STOPPED");

        const updated = await this.prisma.broadcast.findUnique({
            where: { id: broadcast.id },
            include: { channels: true, runs: { orderBy: { finishedAt: "desc" } } },
        });

        const counts = await this.getRecipientCounts(broadcast.id);
        return mapBroadcast(updated!, updated!.channels, updated!.runs, counts.pending, counts.sent, counts.failed);
    }

    async resetForNewRun(tgAccountId: string): Promise<BroadcastDto> {
        const broadcast = await this.findByAccountOrFail(tgAccountId);

        if (broadcast.status !== "COMPLETED" && broadcast.status !== "STOPPED") {
            throw new BadRequestException("broadcast.cannotReset");
        }

        // Archive current run if there are any sent/failed recipients
        const hasSentOrFailed = await this.prisma.broadcastRecipient.count({
            where: {
                broadcastId: broadcast.id,
                status: { in: ["SENT", "FAILED"] },
            },
        });
        if (hasSentOrFailed > 0) {
            await this.archiveCurrentRun(broadcast.id, broadcast.status as "COMPLETED" | "STOPPED");
        }

        // Clear recipients and reset to DRAFT
        await this.prisma.$transaction([
            this.prisma.broadcastRecipient.deleteMany({ where: { broadcastId: broadcast.id } }),
            this.prisma.broadcast.update({
                where: { id: broadcast.id },
                data: { status: "DRAFT", startedAt: null, completedAt: null },
            }),
        ]);

        // Reset recipientCount on all channels
        await this.prisma.broadcastChannel.updateMany({
            where: { broadcastId: broadcast.id },
            data: { recipientCount: null },
        });

        return this.getOrCreate(tgAccountId);
    }

    // ── Internal helpers ──────────────────────────────────────────────────────

    async markCompleted(broadcastId: string): Promise<void> {
        await this.archiveCurrentRun(broadcastId, "COMPLETED");
    }

    async hasPendingRecipients(broadcastId: string): Promise<boolean> {
        const count = await this.prisma.broadcastRecipient.count({
            where: { broadcastId, status: "PENDING" },
        });
        return count > 0;
    }

    async markRecipientSent(recipientId: string): Promise<void> {
        await this.prisma.broadcastRecipient.update({
            where: { id: recipientId },
            data: { status: "SENT", sentAt: new Date() },
        });
    }

    async markRecipientFailed(recipientId: string, errorMessage: string): Promise<void> {
        await this.prisma.broadcastRecipient.update({
            where: { id: recipientId },
            data: { status: "FAILED", errorMessage },
        });
    }

    async getNextPendingRecipient(broadcastId: string) {
        return this.prisma.broadcastRecipient.findFirst({
            where: { broadcastId, status: "PENDING" },
            orderBy: { id: "asc" },
        });
    }

    async getBroadcastById(broadcastId: string) {
        return this.prisma.broadcast.findUnique({
            where: { id: broadcastId },
            include: { tgAccount: true },
        });
    }

    async getAllRunning() {
        return this.prisma.broadcast.findMany({
            where: { status: "RUNNING" },
            include: { tgAccount: true },
        });
    }

    async getRunRecipients(
        runId: string,
        page: number,
        limit: number,
        status?: string,
    ): Promise<PagedResult<BroadcastRunRecipientDto>> {
        const statusFilter = status ? { status: status as any } : {};
        const where = { runId, ...statusFilter };

        const [data, total] = await this.prisma.$transaction([
            this.prisma.broadcastRunRecipient.findMany({
                where,
                orderBy: [{ sentAt: { sort: "desc", nulls: "last" } }, { id: "asc" }],
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.broadcastRunRecipient.count({ where }),
        ]);

        return {
            data: data.map(mapBroadcastRunRecipient),
            meta: { page, limit, total, pageCount: Math.ceil(total / limit) },
        };
    }

    async deleteRun(runId: string): Promise<void> {
        await this.prisma.broadcastRun.delete({ where: { id: runId } });
    }

    async deleteAllRuns(tgAccountId: string): Promise<void> {
        const broadcast = await this.findByAccountOrFail(tgAccountId);
        await this.prisma.broadcastRun.deleteMany({ where: { broadcastId: broadcast.id } });
    }

    async updateChannelRecipientCount(channelId: string, count: number): Promise<void> {
        await this.prisma.broadcastChannel.update({
            where: { id: channelId },
            data: { recipientCount: count },
        });
    }

    async upsertRecipients(
        broadcastId: string,
        recipients: Array<{
            userId: string;
            accessHash: string | null;
            username: string | null;
            firstName: string | null;
            lastName: string | null;
        }>,
    ): Promise<void> {
        for (const r of recipients) {
            await this.prisma.broadcastRecipient.upsert({
                where: { broadcastId_userId: { broadcastId, userId: r.userId } },
                create: { broadcastId, ...r },
                update: { accessHash: r.accessHash },
            });
        }
    }

    // ── Private ───────────────────────────────────────────────────────────────

    private async archiveCurrentRun(
        broadcastId: string,
        status: "COMPLETED" | "STOPPED",
    ): Promise<void> {
        const broadcast = await this.prisma.broadcast.findUnique({
            where: { id: broadcastId },
            include: { channels: true },
        });
        if (!broadcast) return;

        const [sentRecipients, failedRecipients, pendingCount] = await Promise.all([
            this.prisma.broadcastRecipient.findMany({ where: { broadcastId, status: "SENT" } }),
            this.prisma.broadcastRecipient.findMany({ where: { broadcastId, status: "FAILED" } }),
            this.prisma.broadcastRecipient.count({ where: { broadcastId, status: "PENDING" } }),
        ]);

        const sentCount = sentRecipients.length;
        const failedCount = failedRecipients.length;
        const totalCount = sentCount + failedCount + pendingCount;

        const channelsSnapshot = broadcast.channels.map(mapBroadcastChannel);

        const run = await this.prisma.broadcastRun.create({
            data: {
                broadcastId,
                message: broadcast.message,
                channelsSnapshot: channelsSnapshot as any,
                status,
                sentCount,
                failedCount,
                totalCount,
                startedAt: broadcast.startedAt ?? new Date(),
                finishedAt: new Date(),
            },
        });

        const allProcessed = [...sentRecipients, ...failedRecipients];
        if (allProcessed.length > 0) {
            await this.prisma.broadcastRunRecipient.createMany({
                data: allProcessed.map((r) => ({
                    runId: run.id,
                    userId: r.userId,
                    username: r.username,
                    firstName: r.firstName,
                    lastName: r.lastName,
                    status: r.status,
                    errorMessage: r.errorMessage,
                    sentAt: r.sentAt,
                })),
            });
        }

        await this.prisma.broadcast.update({
            where: { id: broadcastId },
            data: { status, completedAt: new Date() },
        });
    }

    private async getRecipientCounts(broadcastId: string) {
        const [pending, sent, failed] = await Promise.all([
            this.prisma.broadcastRecipient.count({ where: { broadcastId, status: "PENDING" } }),
            this.prisma.broadcastRecipient.count({ where: { broadcastId, status: "SENT" } }),
            this.prisma.broadcastRecipient.count({ where: { broadcastId, status: "FAILED" } }),
        ]);
        return { pending, sent, failed };
    }

    async findByAccountOrFail(tgAccountId: string) {
        const broadcast = await this.prisma.broadcast.findUnique({ where: { tgAccountId } });
        if (!broadcast) throw new NotFoundException("broadcast.notFound");
        return broadcast;
    }

    async assertAccountAccess(tgAccountId: string, adminId: string, role: RoleAdmin): Promise<void> {
        if (role === "SUPERADMIN") return;
        const account = await this.prisma.tgAccount.findUnique({
            where: { id: tgAccountId },
            select: { adminId: true },
        });
        if (!account) throw new NotFoundException("tgAccount.notFound");
        if (account.adminId !== adminId) throw new ForbiddenException("broadcast.notAllowed");
    }

    private assertEditable(status: BroadcastStatus): void {
        if (status === "RUNNING") {
            throw new BadRequestException("broadcast.lockedWhileRunning");
        }
    }
}
