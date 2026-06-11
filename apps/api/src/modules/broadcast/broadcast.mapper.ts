import {
    BroadcastChannelDto,
    BroadcastDto,
    BroadcastProgressDto,
    BroadcastRecipientDto,
    BroadcastRunDto,
    BroadcastRunRecipientDto,
} from "@myorg/shared/dto";
import {
    Broadcast,
    BroadcastChannel,
    BroadcastRecipient,
    BroadcastRun,
    BroadcastRunRecipient,
} from "@/generated/prisma";

function channelUrl(username: string | null): string | null {
    return username ? `https://t.me/${username}` : null;
}

export const mapBroadcastChannel = (c: BroadcastChannel): BroadcastChannelDto => ({
    id: c.id,
    telegramId: c.telegramId,
    username: c.username,
    title: c.title,
    photoUrl: c.photoUrl,
    memberCount: c.memberCount,
    recipientCount: c.recipientCount,
    giftCount: c.giftCount,
    fetchError: c.fetchError,
    url: channelUrl(c.username),
});

export const mapBroadcastRecipient = (r: BroadcastRecipient): BroadcastRecipientDto => ({
    id: r.id,
    userId: r.userId,
    username: r.username,
    firstName: r.firstName,
    lastName: r.lastName,
    status: r.status as BroadcastRecipientDto["status"],
    errorMessage: r.errorMessage,
    errorData: (r.errorData as Record<string, unknown> | null) ?? null,
    sentAt: r.sentAt?.toISOString() ?? null,
});

export const mapBroadcastRun = (r: BroadcastRun): BroadcastRunDto => ({
    id: r.id,
    runNumber: 0,
    message: r.message,
    channelsSnapshot: (r.channelsSnapshot as unknown as BroadcastChannelDto[]) ?? [],
    status: r.status as BroadcastRunDto["status"],
    delayBaseSeconds: r.delayBaseSeconds,
    delayJitterSeconds: r.delayJitterSeconds,
    sentCount: r.sentCount,
    failedCount: r.failedCount,
    pendingCount: r.pendingCount,
    totalCount: r.totalCount,
    startedAt: r.startedAt.toISOString(),
    finishedAt: r.finishedAt?.toISOString() ?? null,
});

export const mapBroadcastRunRecipient = (r: BroadcastRunRecipient): BroadcastRunRecipientDto => ({
    id: r.id,
    userId: r.userId,
    accessHash: r.accessHash,
    username: r.username,
    firstName: r.firstName,
    lastName: r.lastName,
    status: r.status as BroadcastRunRecipientDto["status"],
    errorMessage: r.errorMessage,
    errorData: (r.errorData as Record<string, unknown> | null) ?? null,
    sentAt: r.sentAt?.toISOString() ?? null,
});

export const mapBroadcastProgress = (
    broadcast: Broadcast,
    channels: BroadcastChannel[],
    pending: number,
    sent: number,
    failed: number,
): BroadcastProgressDto => ({
    status: broadcast.status as BroadcastProgressDto["status"],
    message: broadcast.message,
    pending,
    sent,
    failed,
    total: pending + sent + failed,
    channels: channels.map(mapBroadcastChannel),
    startedAt: broadcast.startedAt?.toISOString() ?? null,
    delayBaseSeconds: broadcast.delayBaseSeconds,
    delayJitterSeconds: broadcast.delayJitterSeconds,
    nextAttemptAt: broadcast.nextAttemptAt?.toISOString() ?? null,
    estimatedFinishAt: broadcast.estimatedFinishAt?.toISOString() ?? null,
});

export const mapBroadcast = (
    broadcast: Broadcast,
    channels: BroadcastChannel[],
    runs: BroadcastRun[],
    pending: number,
    sent: number,
    failed: number,
): BroadcastDto => {
    const currentRun = runs.find((r) => r.status === "RUNNING");
    return {
        id: broadcast.id,
        message: broadcast.message,
        status: broadcast.status as BroadcastDto["status"],
        currentRunId: currentRun?.id ?? null,
        delayBaseSeconds: broadcast.delayBaseSeconds,
        delayJitterSeconds: broadcast.delayJitterSeconds,
        startedAt: broadcast.startedAt?.toISOString() ?? null,
        completedAt: broadcast.completedAt?.toISOString() ?? null,
        createdAt: broadcast.createdAt.toISOString(),
        channels: channels.map(mapBroadcastChannel),
        progress: mapBroadcastProgress(broadcast, channels, pending, sent, failed),
        runs: runs.map(mapBroadcastRun),
    };
};
