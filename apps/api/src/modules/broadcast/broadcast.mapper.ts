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

export const mapBroadcastChannel = (c: BroadcastChannel): BroadcastChannelDto => ({
    id: c.id,
    telegramId: c.telegramId,
    username: c.username,
    title: c.title,
    photoUrl: c.photoUrl,
    memberCount: c.memberCount,
    recipientCount: c.recipientCount,
});

export const mapBroadcastRecipient = (r: BroadcastRecipient): BroadcastRecipientDto => ({
    id: r.id,
    userId: r.userId,
    username: r.username,
    firstName: r.firstName,
    lastName: r.lastName,
    status: r.status as BroadcastRecipientDto["status"],
    errorMessage: r.errorMessage,
    sentAt: r.sentAt?.toISOString() ?? null,
});

export const mapBroadcastRun = (r: BroadcastRun): BroadcastRunDto => ({
    id: r.id,
    message: r.message,
    channelsSnapshot: (r.channelsSnapshot as unknown as BroadcastChannelDto[]) ?? [],
    status: r.status as BroadcastRunDto["status"],
    sentCount: r.sentCount,
    failedCount: r.failedCount,
    totalCount: r.totalCount,
    startedAt: r.startedAt.toISOString(),
    finishedAt: r.finishedAt.toISOString(),
});

export const mapBroadcastRunRecipient = (r: BroadcastRunRecipient): BroadcastRunRecipientDto => ({
    id: r.id,
    userId: r.userId,
    username: r.username,
    firstName: r.firstName,
    lastName: r.lastName,
    status: r.status as BroadcastRunRecipientDto["status"],
    errorMessage: r.errorMessage,
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
});

export const mapBroadcast = (
    broadcast: Broadcast,
    channels: BroadcastChannel[],
    runs: BroadcastRun[],
    pending: number,
    sent: number,
    failed: number,
): BroadcastDto => ({
    id: broadcast.id,
    message: broadcast.message,
    status: broadcast.status as BroadcastDto["status"],
    startedAt: broadcast.startedAt?.toISOString() ?? null,
    completedAt: broadcast.completedAt?.toISOString() ?? null,
    createdAt: broadcast.createdAt.toISOString(),
    channels: channels.map(mapBroadcastChannel),
    progress: mapBroadcastProgress(broadcast, channels, pending, sent, failed),
    runs: runs.map(mapBroadcastRun),
});
