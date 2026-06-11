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
import { AddBroadcastChannelOutput } from "@myorg/shared/form";
import {
    mapBroadcast,
    mapBroadcastChannel,
    mapBroadcastProgress,
    mapBroadcastRecipient,
    mapBroadcastRun,
    mapBroadcastRunRecipient,
} from "@/modules/broadcast/broadcast.mapper";
import { BroadcastStatus, Prisma, RecipientStatus, RoleAdmin } from "@/generated/prisma";

@Injectable()
export class BroadcastService {
    private readonly logger = new Logger(BroadcastService.name);

    constructor(private readonly prisma: PrismaService) {}

    // ── Get or create ─────────────────────────────────────────────────────────

    async getOrCreate(tgAccountId: string): Promise<BroadcastDto> {
        let broadcast = await this.prisma.broadcast.findUnique({
            where: { tgAccountId },
            include: { channels: true, runs: { orderBy: { startedAt: "desc" } } },
        });

        if (!broadcast) {
            broadcast = await this.prisma.broadcast.create({
                data: { tgAccountId },
                include: { channels: true, runs: { orderBy: { startedAt: "desc" } } },
            });
        }

        const counts = await this.getRecipientCounts(broadcast.id);
        return mapBroadcast(broadcast, broadcast.channels, broadcast.runs, counts.pending, counts.sent, counts.failed);
    }

    // ── Message ───────────────────────────────────────────────────────────────

    async updateMessage(tgAccountId: string, message: string): Promise<BroadcastDto> {
        const broadcast = await this.findByAccountOrFail(tgAccountId);
        this.assertEditable(broadcast.status);

        const updated = await this.prisma.broadcast.update({
            where: { id: broadcast.id },
            data: { message },
            include: { channels: true, runs: { orderBy: { startedAt: "desc" } } },
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
                accessHash: data.accessHash,
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
            this.prisma.broadcastRecipient.deleteMany({ where: { broadcastId: broadcast.id } }),
            this.prisma.broadcastChannel.delete({ where: { id: channelId } }),
        ]);

        return this.getOrCreate(tgAccountId);
    }

    // ── Recipients ────────────────────────────────────────────────────────────

    async getProgress(tgAccountId: string): Promise<BroadcastProgressDto> {
        const broadcast = await this.prisma.broadcast.findUnique({
            where: { tgAccountId },
            include: { channels: true },
        });
        if (!broadcast) throw new NotFoundException("broadcast.notFound");

        const counts = await this.getRecipientCounts(broadcast.id);
        return mapBroadcastProgress(broadcast, broadcast.channels, counts.pending, counts.sent, counts.failed);
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
                orderBy: [{ sentAt: { sort: "desc", nulls: "first" } }, { id: "asc" }],
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
            orderBy: { startedAt: "asc" },
        });
        return runs
            .map((r, i) => ({ ...mapBroadcastRun(r), runNumber: i + 1 }))
            .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
    }

    async getRun(tgAccountId: string, runId: string): Promise<BroadcastRunDto> {
        const broadcast = await this.findByAccountOrFail(tgAccountId);
        const run = await this.prisma.broadcastRun.findFirst({
            where: { id: runId, broadcastId: broadcast.id },
        });
        if (!run) throw new NotFoundException("broadcast.run.notFound");
        const runNumber = await this.prisma.broadcastRun.count({
            where: { broadcastId: broadcast.id, startedAt: { lte: run.startedAt } },
        });
        return { ...mapBroadcastRun(run), runNumber };
    }

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    async start(tgAccountId: string): Promise<BroadcastDto> {
        const broadcast = await this.prisma.broadcast.findUnique({
            where: { tgAccountId },
            include: { channels: true },
        });
        if (!broadcast) throw new NotFoundException("broadcast.notFound");

        if (broadcast.status === "RUNNING") {
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

        const now = new Date();
        const channelsSnapshot = broadcast.channels.map(mapBroadcastChannel);

        // Atomically flip DRAFT → RUNNING so two concurrent starts can't both create a run.
        await this.prisma.$transaction(async (tx) => {
            const res = await tx.broadcast.updateMany({
                where: { id: broadcast.id, status: { not: "RUNNING" } },
                data: { status: "RUNNING", startedAt: now, completedAt: null },
            });
            if (res.count === 0) {
                throw new BadRequestException("broadcast.alreadyRunning");
            }
            await tx.broadcastRun.create({
                data: {
                    broadcastId: broadcast.id,
                    message: broadcast.message,
                    channelsSnapshot: channelsSnapshot as any,
                    status: "RUNNING",
                    sentCount: 0,
                    failedCount: 0,
                    totalCount: pendingCount,
                    startedAt: now,
                },
            });
        });

        const fresh = await this.prisma.broadcast.findUnique({
            where: { id: broadcast.id },
            include: { channels: true, runs: { orderBy: { startedAt: "desc" } } },
        });

        const counts = await this.getRecipientCounts(broadcast.id);
        return mapBroadcast(fresh!, fresh!.channels, fresh!.runs, counts.pending, counts.sent, counts.failed);
    }

    async stop(tgAccountId: string): Promise<BroadcastDto> {
        const broadcast = await this.findByAccountOrFail(tgAccountId);

        if (broadcast.status === "DRAFT") {
            throw new BadRequestException("broadcast.notRunning");
        }

        if (broadcast.status === "RUNNING") {
            await this.archiveCurrentRun(broadcast.id, "STOPPED");
        }

        const updated = await this.prisma.broadcast.findUnique({
            where: { id: broadcast.id },
            include: { channels: true, runs: { orderBy: { startedAt: "desc" } } },
        });

        const counts = await this.getRecipientCounts(broadcast.id);
        return mapBroadcast(updated!, updated!.channels, updated!.runs, counts.pending, counts.sent, counts.failed);
    }

    async resetForNewRun(tgAccountId: string): Promise<BroadcastDto> {
        return this.getOrCreate(tgAccountId);
    }

    // ── Internal helpers (worker) ─────────────────────────────────────────────

    async markCompleted(broadcastId: string): Promise<void> {
        await this.archiveCurrentRun(broadcastId, "COMPLETED");
    }

    async markStopped(broadcastId: string): Promise<void> {
        await this.archiveCurrentRun(broadcastId, "STOPPED");
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
            data: { status: "SENT", sentAt: new Date(), errorMessage: null, errorData: Prisma.DbNull },
        });
    }

    async noteRecipientError(
        recipientId: string,
        errorMessage: string,
        errorData?: Record<string, unknown>,
    ): Promise<void> {
        await this.prisma.broadcastRecipient.update({
            where: { id: recipientId },
            data: {
                errorMessage,
                errorData: errorData != null ? (errorData as Prisma.InputJsonValue) : Prisma.DbNull,
            },
        });
    }

    async markRecipientFailed(
        recipientId: string,
        errorMessage: string,
        errorData?: Record<string, unknown>,
    ): Promise<void> {
        await this.prisma.broadcastRecipient.update({
            where: { id: recipientId },
            data: {
                status: "FAILED",
                sentAt: new Date(),
                errorMessage,
                errorData: errorData != null ? (errorData as Prisma.InputJsonValue) : Prisma.DbNull,
            },
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
        tgAccountId: string,
        runId: string,
        page: number,
        limit: number,
        status?: string,
    ): Promise<PagedResult<BroadcastRunRecipientDto>> {
        const broadcast = await this.findByAccountOrFail(tgAccountId);
        const run = await this.prisma.broadcastRun.findFirst({ where: { id: runId, broadcastId: broadcast.id }, select: { id: true } });
        if (!run) throw new NotFoundException("broadcast.run.notFound");
        const statusFilter = status ? { status: status as any } : {};
        const where = { runId, ...statusFilter };

        const [data, total] = await this.prisma.$transaction([
            this.prisma.broadcastRunRecipient.findMany({
                where,
                orderBy: [{ sentAt: { sort: "desc", nulls: "first" } }, { id: "asc" }],
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

    async deleteRun(tgAccountId: string, runId: string): Promise<void> {
        const broadcast = await this.findByAccountOrFail(tgAccountId);
        const run = await this.prisma.broadcastRun.findFirst({ where: { id: runId, broadcastId: broadcast.id }, select: { status: true } });
        if (!run) throw new NotFoundException("broadcast.run.notFound");
        if (run.status === "RUNNING") throw new BadRequestException("broadcast.run.cannotDeleteRunning");
        await this.prisma.broadcastRun.delete({ where: { id: runId } });
    }

    async deleteAllRuns(tgAccountId: string): Promise<void> {
        const broadcast = await this.findByAccountOrFail(tgAccountId);
        await this.prisma.broadcastRun.deleteMany({
            where: { broadcastId: broadcast.id, status: { not: "RUNNING" } },
        });
    }

    async updateChannelRecipientCount(channelId: string, recipientCount: number, giftCount: number): Promise<void> {
        await this.prisma.broadcastChannel.update({
            where: { id: channelId },
            data: { recipientCount, giftCount, fetchError: null },
        });
    }

    async updateChannelFetchError(channelId: string, error: string): Promise<void> {
        await this.prisma.broadcastChannel.update({
            where: { id: channelId },
            data: { fetchError: error },
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
        await this.prisma.$transaction(
            recipients.map((r) =>
                this.prisma.broadcastRecipient.upsert({
                    where: { broadcastId_userId: { broadcastId, userId: r.userId } },
                    create: { broadcastId, ...r },
                    update: {
                        accessHash: r.accessHash,
                        username: r.username,
                        firstName: r.firstName,
                        lastName: r.lastName,
                    },
                }),
            ),
        );
    }

    async findChannel(broadcastId: string, channelId: string) {
        return this.prisma.broadcastChannel.findFirst({
            where: { id: channelId, broadcastId },
        });
    }

    // ── Private ───────────────────────────────────────────────────────────────

    private async archiveCurrentRun(broadcastId: string, status: "COMPLETED" | "STOPPED"): Promise<void> {
        const runningRun = await this.prisma.broadcastRun.findFirst({
            where: { broadcastId, status: "RUNNING" },
        });

        const allRecipients = await this.prisma.broadcastRecipient.findMany({ where: { broadcastId } });

        const sentCount = allRecipients.filter((r) => r.status === "SENT").length;
        const failedCount = allRecipients.filter((r) => r.status === "FAILED").length;
        const pendingCount = allRecipients.filter((r) => r.status === "PENDING").length;
        const totalCount = allRecipients.length;
        const finishedAt = new Date();

        // A concurrent stop()/markCompleted may have already finalized this run (run no
        // longer RUNNING) and wiped its recipients. Without this guard the else-branch
        // below would create a spurious empty duplicate history entry.
        if (!runningRun && allRecipients.length === 0) return;

        let runId: string;
        if (runningRun) {
            await this.prisma.broadcastRun.update({
                where: { id: runningRun.id },
                data: { status, sentCount, failedCount, pendingCount, totalCount, finishedAt },
            });
            runId = runningRun.id;
        } else {
            const broadcast = await this.prisma.broadcast.findUnique({
                where: { id: broadcastId },
                include: { channels: true },
            });
            if (!broadcast) return;
            const channelsSnapshot = broadcast.channels.map(mapBroadcastChannel);
            const run = await this.prisma.broadcastRun.create({
                data: {
                    broadcastId,
                    message: broadcast.message,
                    channelsSnapshot: channelsSnapshot as any,
                    status,
                    sentCount,
                    failedCount,
                    pendingCount,
                    totalCount,
                    startedAt: broadcast.startedAt ?? finishedAt,
                    finishedAt,
                },
            });
            runId = run.id;
        }

        if (allRecipients.length > 0) {
            await this.prisma.broadcastRunRecipient.createMany({
                data: allRecipients.map((r) => ({
                    runId,
                    userId: r.userId,
                    accessHash: r.accessHash,
                    username: r.username,
                    firstName: r.firstName,
                    lastName: r.lastName,
                    status: r.status === "PENDING" && status === "STOPPED" ? "CANCELLED" : r.status,
                    errorMessage: r.errorMessage,
                    errorData: r.errorData != null ? (r.errorData as Prisma.InputJsonValue) : Prisma.DbNull,
                    sentAt: r.sentAt ?? (r.status === "PENDING" && status === "STOPPED" ? finishedAt : null),
                })),
                skipDuplicates: true,
            });
        }

        await this.prisma.$transaction([
            this.prisma.broadcastRecipient.deleteMany({ where: { broadcastId } }),
            this.prisma.broadcastChannel.deleteMany({ where: { broadcastId } }),
            this.prisma.broadcast.update({
                where: { id: broadcastId },
                data: { status: "DRAFT", startedAt: null, completedAt: finishedAt },
            }),
        ]);
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
