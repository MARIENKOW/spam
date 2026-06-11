export type BroadcastStatus = "DRAFT" | "RUNNING" | "COMPLETED" | "STOPPED";
export type RecipientStatus = "PENDING" | "SENT" | "FAILED" | "CANCELLED";
export type RunStatus = "RUNNING" | "COMPLETED" | "STOPPED";

export interface BroadcastChannelDto {
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

export interface BroadcastRecipientDto {
    id: string;
    userId: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    status: RecipientStatus;
    errorMessage: string | null;
    errorData: Record<string, unknown> | null;
    sentAt: string | null;
}

export interface BroadcastRunDto {
    id: string;
    runNumber: number;
    message: string;
    channelsSnapshot: BroadcastChannelDto[];
    status: RunStatus;
    delayBaseSeconds: number;
    delayJitterSeconds: number;
    sentCount: number;
    failedCount: number;
    pendingCount: number;
    totalCount: number;
    startedAt: string;
    finishedAt: string | null;
}

export interface BroadcastRunRecipientDto {
    id: string;
    userId: string;
    accessHash: string | null;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    status: RecipientStatus;
    errorMessage: string | null;
    errorData: Record<string, unknown> | null;
    sentAt: string | null;
}

export interface BroadcastProgressDto {
    status: BroadcastStatus;
    message: string;
    pending: number;
    sent: number;
    failed: number;
    total: number;
    channels: BroadcastChannelDto[];
    startedAt: string | null;
    delayBaseSeconds: number;
    delayJitterSeconds: number;
    nextAttemptAt: string | null;
    estimatedFinishAt: string | null;
}

export interface BroadcastDto {
    id: string;
    message: string;
    status: BroadcastStatus;
    currentRunId: string | null;
    delayBaseSeconds: number;
    delayJitterSeconds: number;
    startedAt: string | null;
    completedAt: string | null;
    createdAt: string;
    channels: BroadcastChannelDto[];
    progress: BroadcastProgressDto;
    runs: BroadcastRunDto[];
}

export interface ChannelSearchResultDto {
    telegramId: string;
    accessHash: string | null;
    username: string | null;
    title: string;
    photoBase64: string | null;
    memberCount: number | null;
}
