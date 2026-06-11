import {
    InviteChannelDto,
    InviteDto,
    InviteProgressDto,
    InviteRecipientDto,
    InviteRunDto,
    InviteRunRecipientDto,
} from "@myorg/shared/dto";
import {
    Invite,
    InviteChannel,
    InviteRecipient,
    InviteRun,
    InviteRunRecipient,
} from "@/generated/prisma";

function channelUrl(username: string | null): string | null {
    return username ? `https://t.me/${username}` : null;
}

export const mapInviteChannel = (c: InviteChannel): InviteChannelDto => ({
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

export const mapInviteRecipient = (r: InviteRecipient): InviteRecipientDto => ({
    id: r.id,
    userId: r.userId,
    username: r.username,
    firstName: r.firstName,
    lastName: r.lastName,
    status: r.status as InviteRecipientDto["status"],
    errorMessage: r.errorMessage,
    errorData: (r.errorData as Record<string, unknown> | null) ?? null,
    invitedAt: r.invitedAt?.toISOString() ?? null,
});

export const mapInviteRun = (r: InviteRun): InviteRunDto => {
    const snapshot = r.targetChannelSnapshot as any;
    return {
        id: r.id,
        runNumber: 0,
        targetChannelSnapshot: snapshot
            ? {
                  telegramId: snapshot.telegramId,
                  accessHash: snapshot.accessHash ?? null,
                  title: snapshot.title,
                  username: snapshot.username ?? null,
                  url: snapshot.url ?? channelUrl(snapshot.username ?? null),
                  photoBase64: snapshot.photoBase64 ?? null,
              }
            : null,
        channelsSnapshot: ((r.channelsSnapshot as unknown as InviteChannelDto[]) ?? []),
        status: r.status as InviteRunDto["status"],
        delayBaseSeconds: r.delayBaseSeconds,
        delayJitterSeconds: r.delayJitterSeconds,
        invitedCount: r.invitedCount,
        failedCount: r.failedCount,
        pendingCount: r.pendingCount,
        totalCount: r.totalCount,
        startedAt: r.startedAt.toISOString(),
        finishedAt: r.finishedAt?.toISOString() ?? null,
    };
};

export const mapInviteRunRecipient = (r: InviteRunRecipient): InviteRunRecipientDto => ({
    id: r.id,
    userId: r.userId,
    accessHash: r.accessHash,
    username: r.username,
    firstName: r.firstName,
    lastName: r.lastName,
    status: r.status as InviteRunRecipientDto["status"],
    errorMessage: r.errorMessage,
    errorData: (r.errorData as Record<string, unknown> | null) ?? null,
    invitedAt: r.invitedAt?.toISOString() ?? null,
});

export const mapInviteProgress = (
    invite: Invite,
    channels: InviteChannel[],
    pending: number,
    sent: number,
    failed: number,
): InviteProgressDto => ({
    status: invite.status as InviteProgressDto["status"],
    targetChannelTelegramId: invite.targetChannelTelegramId,
    targetChannelTitle: invite.targetChannelTitle,
    pending,
    sent,
    failed,
    total: pending + sent + failed,
    channels: channels.map(mapInviteChannel),
    startedAt: invite.startedAt?.toISOString() ?? null,
    delayBaseSeconds: invite.delayBaseSeconds,
    delayJitterSeconds: invite.delayJitterSeconds,
    nextAttemptAt: invite.nextAttemptAt?.toISOString() ?? null,
    estimatedFinishAt: invite.estimatedFinishAt?.toISOString() ?? null,
});

export const mapInvite = (
    invite: Invite,
    channels: InviteChannel[],
    runs: InviteRun[],
    pending: number,
    sent: number,
    failed: number,
): InviteDto => {
    const currentRun = runs.find((r) => r.status === "RUNNING");
    return {
        id: invite.id,
        status: invite.status as InviteDto["status"],
        currentRunId: currentRun?.id ?? null,
        targetChannelTelegramId: invite.targetChannelTelegramId,
        targetChannelAccessHash: invite.targetChannelAccessHash,
        targetChannelTitle: invite.targetChannelTitle,
        delayBaseSeconds: invite.delayBaseSeconds,
        delayJitterSeconds: invite.delayJitterSeconds,
        startedAt: invite.startedAt?.toISOString() ?? null,
        completedAt: invite.completedAt?.toISOString() ?? null,
        createdAt: invite.createdAt.toISOString(),
        channels: channels.map(mapInviteChannel),
        progress: mapInviteProgress(invite, channels, pending, sent, failed),
        runs: runs.map(mapInviteRun),
    };
};
