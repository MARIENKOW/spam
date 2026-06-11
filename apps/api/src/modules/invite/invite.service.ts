import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";
import {
    InviteDto,
    InviteProgressDto,
    InviteRecipientDto,
    InviteRunDto,
    InviteRunRecipientDto,
    PagedResult,
} from "@myorg/shared/dto";
import { AddInviteChannelOutput, SetInviteTargetChannelOutput } from "@myorg/shared/form";
import {
    mapInvite,
    mapInviteChannel,
    mapInviteProgress,
    mapInviteRecipient,
    mapInviteRun,
    mapInviteRunRecipient,
} from "@/modules/invite/invite.mapper";
import { InviteStatus, Prisma, RecipientStatus, RoleAdmin } from "@/generated/prisma";

@Injectable()
export class InviteService {
    private readonly logger = new Logger(InviteService.name);

    constructor(private readonly prisma: PrismaService) {}

    // ── Get or create ─────────────────────────────────────────────────────────

    async getOrCreate(tgAccountId: string): Promise<InviteDto> {
        let invite = await this.prisma.invite.findUnique({
            where: { tgAccountId },
            include: { channels: true, runs: { orderBy: { startedAt: "desc" } } },
        });

        if (!invite) {
            invite = await this.prisma.invite.create({
                data: { tgAccountId },
                include: { channels: true, runs: { orderBy: { startedAt: "desc" } } },
            });
        }

        const counts = await this.getRecipientCounts(invite.id);
        return mapInvite(invite, invite.channels, invite.runs, counts.pending, counts.sent, counts.failed);
    }

    // ── Target channel ────────────────────────────────────────────────────────

    async setTargetChannel(tgAccountId: string, data: SetInviteTargetChannelOutput): Promise<InviteDto> {
        const invite = await this.findByAccountOrFail(tgAccountId);
        this.assertEditable(invite.status);

        const updated = await this.prisma.invite.update({
            where: { id: invite.id },
            data: {
                targetChannelTelegramId: data.telegramId,
                targetChannelAccessHash: data.accessHash,
                targetChannelTitle: data.title,
                targetChannelUsername: data.username,
                targetChannelPhoto: data.photoBase64,
            },
            include: { channels: true, runs: { orderBy: { startedAt: "desc" } } },
        });

        const counts = await this.getRecipientCounts(updated.id);
        return mapInvite(updated, updated.channels, updated.runs, counts.pending, counts.sent, counts.failed);
    }

    // ── Channels ──────────────────────────────────────────────────────────────

    async addChannel(tgAccountId: string, data: AddInviteChannelOutput): Promise<InviteDto> {
        const invite = await this.findByAccountOrFail(tgAccountId);
        this.assertEditable(invite.status);

        const existing = await this.prisma.inviteChannel.findUnique({
            where: { inviteId_telegramId: { inviteId: invite.id, telegramId: data.telegramId } },
        });
        if (existing) return this.getOrCreate(tgAccountId);

        await this.prisma.inviteChannel.create({
            data: {
                inviteId: invite.id,
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

    async removeChannel(tgAccountId: string, channelId: string): Promise<InviteDto> {
        const invite = await this.findByAccountOrFail(tgAccountId);
        this.assertEditable(invite.status);

        const channel = await this.prisma.inviteChannel.findFirst({
            where: { id: channelId, inviteId: invite.id },
        });
        if (!channel) throw new NotFoundException("channel.notFound");

        await this.prisma.$transaction([
            this.prisma.inviteRecipient.deleteMany({ where: { inviteId: invite.id } }),
            this.prisma.inviteChannel.delete({ where: { id: channelId } }),
        ]);

        return this.getOrCreate(tgAccountId);
    }

    // ── Recipients ────────────────────────────────────────────────────────────

    async getProgress(tgAccountId: string): Promise<InviteProgressDto> {
        const invite = await this.prisma.invite.findUnique({
            where: { tgAccountId },
            include: { channels: true },
        });
        if (!invite) throw new NotFoundException("invite.notFound");

        const counts = await this.getRecipientCounts(invite.id);
        return mapInviteProgress(invite, invite.channels, counts.pending, counts.sent, counts.failed);
    }

    async getRecipients(
        tgAccountId: string,
        page: number,
        limit: number,
        status?: string,
    ): Promise<PagedResult<InviteRecipientDto>> {
        const invite = await this.findByAccountOrFail(tgAccountId);

        const statusFilter =
            status === "PROCESSED"
                ? { status: { in: ["SENT" as RecipientStatus, "FAILED" as RecipientStatus] } }
                : status
                ? { status: status as RecipientStatus }
                : {};

        const where = { inviteId: invite.id, ...statusFilter };

        const [data, total] = await this.prisma.$transaction([
            this.prisma.inviteRecipient.findMany({
                where,
                orderBy: [{ invitedAt: { sort: "desc", nulls: "first" } }, { id: "asc" }],
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.inviteRecipient.count({ where }),
        ]);

        return {
            data: data.map(mapInviteRecipient),
            meta: { page, limit, total, pageCount: Math.ceil(total / limit) },
        };
    }

    async getHistory(tgAccountId: string): Promise<InviteRunDto[]> {
        const invite = await this.findByAccountOrFail(tgAccountId);
        const runs = await this.prisma.inviteRun.findMany({
            where: { inviteId: invite.id },
            orderBy: { startedAt: "asc" },
        });
        const total = runs.length;
        return runs
            .map((r, i) => ({ ...mapInviteRun(r), runNumber: i + 1 }))
            .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
    }

    async getRun(tgAccountId: string, runId: string): Promise<InviteRunDto> {
        const invite = await this.findByAccountOrFail(tgAccountId);
        const run = await this.prisma.inviteRun.findFirst({
            where: { id: runId, inviteId: invite.id },
        });
        if (!run) throw new NotFoundException("invite.run.notFound");
        const runNumber = await this.prisma.inviteRun.count({
            where: { inviteId: invite.id, startedAt: { lte: run.startedAt } },
        });
        return { ...mapInviteRun(run), runNumber };
    }

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    async start(tgAccountId: string): Promise<InviteDto> {
        const invite = await this.prisma.invite.findUnique({
            where: { tgAccountId },
            include: { channels: true },
        });
        if (!invite) throw new NotFoundException("invite.notFound");

        if (invite.status === "RUNNING") {
            throw new BadRequestException("invite.alreadyRunning");
        }

        if (!invite.targetChannelTelegramId) {
            throw new BadRequestException("invite.noTargetChannel");
        }

        if (invite.channels.length === 0) {
            throw new BadRequestException("invite.noChannels");
        }

        const pendingCount = await this.prisma.inviteRecipient.count({
            where: { inviteId: invite.id, status: "PENDING" },
        });
        if (pendingCount === 0) {
            throw new BadRequestException("invite.noRecipients");
        }

        const now = new Date();
        const targetChannelSnapshot = invite.targetChannelTelegramId
            ? {
                  telegramId: invite.targetChannelTelegramId,
                  accessHash: invite.targetChannelAccessHash,
                  title: invite.targetChannelTitle ?? "",
                  username: invite.targetChannelUsername ?? null,
                  url: invite.targetChannelUsername ? `https://t.me/${invite.targetChannelUsername}` : `https://t.me/c/${invite.targetChannelTelegramId}/1`,
                  photoBase64: invite.targetChannelPhoto ?? null,
              }
            : null;
        const channelsSnapshot = invite.channels.map(mapInviteChannel);

        // Atomically flip DRAFT → RUNNING so two concurrent starts can't both create a run.
        await this.prisma.$transaction(async (tx) => {
            const res = await tx.invite.updateMany({
                where: { id: invite.id, status: { not: "RUNNING" } },
                data: { status: "RUNNING", startedAt: now, completedAt: null },
            });
            if (res.count === 0) {
                throw new BadRequestException("invite.alreadyRunning");
            }
            await tx.inviteRun.create({
                data: {
                    inviteId: invite.id,
                    targetChannelSnapshot: targetChannelSnapshot as any,
                    channelsSnapshot: channelsSnapshot as any,
                    status: "RUNNING",
                    invitedCount: 0,
                    failedCount: 0,
                    totalCount: pendingCount,
                    startedAt: now,
                },
            });
        });

        const freshInvite = await this.prisma.invite.findUnique({
            where: { id: invite.id },
            include: { channels: true, runs: { orderBy: { startedAt: "desc" } } },
        });

        const counts = await this.getRecipientCounts(invite.id);
        return mapInvite(freshInvite!, freshInvite!.channels, freshInvite!.runs, counts.pending, counts.sent, counts.failed);
    }

    async stop(tgAccountId: string): Promise<InviteDto> {
        const invite = await this.findByAccountOrFail(tgAccountId);

        if (invite.status === "DRAFT") {
            throw new BadRequestException("invite.notRunning");
        }

        if (invite.status === "RUNNING") {
            await this.archiveCurrentRun(invite.id, "STOPPED");
        }

        const updated = await this.prisma.invite.findUnique({
            where: { id: invite.id },
            include: { channels: true, runs: { orderBy: { startedAt: "desc" } } },
        });

        const counts = await this.getRecipientCounts(invite.id);
        return mapInvite(updated!, updated!.channels, updated!.runs, counts.pending, counts.sent, counts.failed);
    }

    async resetForNewRun(tgAccountId: string): Promise<InviteDto> {
        return this.getOrCreate(tgAccountId);
    }

    // ── Internal helpers ──────────────────────────────────────────────────────

    async markCompleted(inviteId: string): Promise<void> {
        await this.archiveCurrentRun(inviteId, "COMPLETED");
    }

    async markStopped(inviteId: string): Promise<void> {
        await this.archiveCurrentRun(inviteId, "STOPPED");
    }

    async hasPendingRecipients(inviteId: string): Promise<boolean> {
        const count = await this.prisma.inviteRecipient.count({
            where: { inviteId, status: "PENDING" },
        });
        return count > 0;
    }

    async markRecipientSent(recipientId: string): Promise<void> {
        await this.prisma.inviteRecipient.update({
            where: { id: recipientId },
            data: { status: "SENT", invitedAt: new Date(), errorMessage: null, errorData: Prisma.DbNull },
        });
    }

    async noteRecipientError(
        recipientId: string,
        errorMessage: string,
        errorData?: Record<string, unknown>,
    ): Promise<void> {
        await this.prisma.inviteRecipient.update({
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
        await this.prisma.inviteRecipient.update({
            where: { id: recipientId },
            data: {
                status: "FAILED",
                invitedAt: new Date(),
                errorMessage,
                errorData: errorData != null ? (errorData as Prisma.InputJsonValue) : Prisma.DbNull,
            },
        });
    }

    async getNextPendingRecipient(inviteId: string) {
        return this.prisma.inviteRecipient.findFirst({
            where: { inviteId, status: "PENDING" },
            orderBy: { id: "asc" },
        });
    }

    async getInviteById(inviteId: string) {
        return this.prisma.invite.findUnique({
            where: { id: inviteId },
            include: { tgAccount: true },
        });
    }

    async getAllRunning() {
        return this.prisma.invite.findMany({
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
    ): Promise<PagedResult<InviteRunRecipientDto>> {
        const invite = await this.findByAccountOrFail(tgAccountId);
        const run = await this.prisma.inviteRun.findFirst({ where: { id: runId, inviteId: invite.id }, select: { id: true } });
        if (!run) throw new NotFoundException("invite.run.notFound");
        const statusFilter = status ? { status: status as any } : {};
        const where = { runId, ...statusFilter };

        const [data, total] = await this.prisma.$transaction([
            this.prisma.inviteRunRecipient.findMany({
                where,
                orderBy: [{ invitedAt: { sort: "desc", nulls: "first" } }, { id: "asc" }],
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.inviteRunRecipient.count({ where }),
        ]);

        return {
            data: data.map(mapInviteRunRecipient),
            meta: { page, limit, total, pageCount: Math.ceil(total / limit) },
        };
    }

    async deleteRun(tgAccountId: string, runId: string): Promise<void> {
        const invite = await this.findByAccountOrFail(tgAccountId);
        const run = await this.prisma.inviteRun.findFirst({ where: { id: runId, inviteId: invite.id }, select: { status: true } });
        if (!run) throw new NotFoundException("invite.run.notFound");
        if (run.status === "RUNNING") throw new BadRequestException("invite.run.cannotDeleteRunning");
        await this.prisma.inviteRun.delete({ where: { id: runId } });
    }

    async deleteAllRuns(tgAccountId: string): Promise<void> {
        const invite = await this.findByAccountOrFail(tgAccountId);
        await this.prisma.inviteRun.deleteMany({
            where: { inviteId: invite.id, status: { not: "RUNNING" } },
        });
    }

    async updateChannelRecipientCount(channelId: string, recipientCount: number, giftCount: number): Promise<void> {
        await this.prisma.inviteChannel.update({
            where: { id: channelId },
            data: { recipientCount, giftCount, fetchError: null },
        });
    }

    async updateChannelFetchError(channelId: string, error: string): Promise<void> {
        await this.prisma.inviteChannel.update({
            where: { id: channelId },
            data: { fetchError: error },
        });
    }

    async upsertRecipients(
        inviteId: string,
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
                this.prisma.inviteRecipient.upsert({
                    where: { inviteId_userId: { inviteId, userId: r.userId } },
                    create: { inviteId, ...r },
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

    async findChannel(inviteId: string, channelId: string) {
        return this.prisma.inviteChannel.findFirst({
            where: { id: channelId, inviteId },
        });
    }

    // ── Private ───────────────────────────────────────────────────────────────

    private async archiveCurrentRun(inviteId: string, status: "COMPLETED" | "STOPPED"): Promise<void> {
        const runningRun = await this.prisma.inviteRun.findFirst({
            where: { inviteId, status: "RUNNING" },
        });

        const allRecipients = await this.prisma.inviteRecipient.findMany({ where: { inviteId } });

        const invitedCount = allRecipients.filter((r) => r.status === "SENT").length;
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
            await this.prisma.inviteRun.update({
                where: { id: runningRun.id },
                data: { status, invitedCount, failedCount, pendingCount, totalCount, finishedAt },
            });
            runId = runningRun.id;
        } else {
            const invite = await this.prisma.invite.findUnique({
                where: { id: inviteId },
                include: { channels: true },
            });
            if (!invite) return;
            const targetChannelSnapshot = invite.targetChannelTelegramId
                ? {
                      telegramId: invite.targetChannelTelegramId,
                      accessHash: invite.targetChannelAccessHash,
                      title: invite.targetChannelTitle ?? "",
                      username: invite.targetChannelUsername ?? null,
                      url: invite.targetChannelUsername ? `https://t.me/${invite.targetChannelUsername}` : `https://t.me/c/${invite.targetChannelTelegramId}/1`,
                      photoBase64: invite.targetChannelPhoto ?? null,
                  }
                : null;
            const channelsSnapshot = invite.channels.map(mapInviteChannel);
            const run = await this.prisma.inviteRun.create({
                data: {
                    inviteId,
                    targetChannelSnapshot: targetChannelSnapshot as any,
                    channelsSnapshot: channelsSnapshot as any,
                    status,
                    invitedCount,
                    failedCount,
                    pendingCount,
                    totalCount,
                    startedAt: invite.startedAt ?? finishedAt,
                    finishedAt,
                },
            });
            runId = run.id;
        }

        if (allRecipients.length > 0) {
            await this.prisma.inviteRunRecipient.createMany({
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
                    invitedAt: r.invitedAt ?? (r.status === "PENDING" && status === "STOPPED" ? finishedAt : null),
                })),
                skipDuplicates: true,
            });
        }

        await this.prisma.$transaction([
            this.prisma.inviteRecipient.deleteMany({ where: { inviteId } }),
            this.prisma.inviteChannel.deleteMany({ where: { inviteId } }),
            this.prisma.invite.update({
                where: { id: inviteId },
                data: {
                    status: "DRAFT",
                    startedAt: null,
                    completedAt: finishedAt,
                    targetChannelTelegramId: null,
                    targetChannelAccessHash: null,
                    targetChannelTitle: null,
                },
            }),
        ]);
    }

    private async getRecipientCounts(inviteId: string) {
        const [pending, sent, failed] = await Promise.all([
            this.prisma.inviteRecipient.count({ where: { inviteId, status: "PENDING" } }),
            this.prisma.inviteRecipient.count({ where: { inviteId, status: "SENT" } }),
            this.prisma.inviteRecipient.count({ where: { inviteId, status: "FAILED" } }),
        ]);
        return { pending, sent, failed };
    }

    async findByAccountOrFail(tgAccountId: string) {
        const invite = await this.prisma.invite.findUnique({ where: { tgAccountId } });
        if (!invite) throw new NotFoundException("invite.notFound");
        return invite;
    }

    async assertAccountAccess(tgAccountId: string, adminId: string, role: RoleAdmin): Promise<void> {
        if (role === "SUPERADMIN") return;
        const account = await this.prisma.tgAccount.findUnique({
            where: { id: tgAccountId },
            select: { adminId: true },
        });
        if (!account) throw new NotFoundException("tgAccount.notFound");
        if (account.adminId !== adminId) throw new ForbiddenException("invite.notAllowed");
    }

    private assertEditable(status: InviteStatus): void {
        if (status === "RUNNING") {
            throw new BadRequestException("invite.lockedWhileRunning");
        }
    }
}
