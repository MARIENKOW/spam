export type BroadcastStatus = "DRAFT" | "RUNNING" | "COMPLETED" | "STOPPED";
export type RecipientStatus = "PENDING" | "SENT" | "FAILED";
export type RunStatus = "COMPLETED" | "STOPPED";

export interface BroadcastChannelDto {
    id: string;
    telegramId: string;
    username: string | null;
    title: string;
    photoUrl: string | null;
    memberCount: number | null;
    recipientCount: number | null;
}

export interface BroadcastRecipientDto {
    id: string;
    userId: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    status: RecipientStatus;
    errorMessage: string | null;
    sentAt: string | null;
}

export interface BroadcastRunDto {
    id: string;
    message: string;
    channelsSnapshot: BroadcastChannelDto[];
    status: RunStatus;
    sentCount: number;
    failedCount: number;
    totalCount: number;
    startedAt: string;
    finishedAt: string;
}

export interface BroadcastRunRecipientDto {
    id: string;
    userId: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    status: RecipientStatus;
    errorMessage: string | null;
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
}

export interface BroadcastDto {
    id: string;
    message: string;
    status: BroadcastStatus;
    startedAt: string | null;
    completedAt: string | null;
    createdAt: string;
    channels: BroadcastChannelDto[];
    progress: BroadcastProgressDto;
    runs: BroadcastRunDto[];
}

export interface ChannelSearchResultDto {
    telegramId: string;
    username: string | null;
    title: string;
    photoBase64: string | null;
    memberCount: number | null;
}
