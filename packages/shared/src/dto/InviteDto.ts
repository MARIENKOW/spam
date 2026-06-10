export type InviteStatus = "DRAFT" | "RUNNING" | "COMPLETED" | "STOPPED";

export interface TgOwnedChannelDto {
    id: string;
    telegramId: string;
    accessHash: string;
    title: string;
    username: string | null;
    url: string;
    photoBase64: string | null;
    memberCount: number | null;
    updatedAt: string;
}

export interface InviteChannelDto {
    id: string;
    telegramId: string;
    username: string | null;
    title: string;
    photoUrl: string | null;
    memberCount: number | null;
    recipientCount: number | null;
    giftCount: number | null;
    fetchError: string | null;
    url: string | null;
}

export interface InviteRecipientDto {
    id: string;
    userId: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    status: "PENDING" | "SENT" | "FAILED" | "CANCELLED";
    errorMessage: string | null;
    errorData: Record<string, unknown> | null;
    invitedAt: string | null;
}

export interface InviteRunDto {
    id: string;
    runNumber: number;
    targetChannelSnapshot: { telegramId: string; accessHash: string | null; title: string; url: string | null; username: string | null; photoBase64: string | null } | null;
    channelsSnapshot: InviteChannelDto[];
    status: "RUNNING" | "COMPLETED" | "STOPPED";
    invitedCount: number;
    failedCount: number;
    pendingCount: number;
    totalCount: number;
    startedAt: string;
    finishedAt: string | null;
}

export interface InviteRunRecipientDto {
    id: string;
    userId: string;
    accessHash: string | null;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    status: "PENDING" | "SENT" | "FAILED" | "CANCELLED";
    errorMessage: string | null;
    errorData: Record<string, unknown> | null;
    invitedAt: string | null;
}

export interface InviteProgressDto {
    status: InviteStatus;
    targetChannelTelegramId: string | null;
    targetChannelTitle: string | null;
    pending: number;
    sent: number;
    failed: number;
    total: number;
    channels: InviteChannelDto[];
    startedAt: string | null;
}

export interface InviteDto {
    id: string;
    status: InviteStatus;
    currentRunId: string | null;
    targetChannelTelegramId: string | null;
    targetChannelAccessHash: string | null;
    targetChannelTitle: string | null;
    startedAt: string | null;
    completedAt: string | null;
    createdAt: string;
    channels: InviteChannelDto[];
    progress: InviteProgressDto;
    runs: InviteRunDto[];
}

export interface SetInviteTargetChannelDto {
    telegramId: string;
    accessHash: string;
    title: string;
}
