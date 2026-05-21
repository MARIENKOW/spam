import type {
    AdminParams,
    BlogParams,
    ImageParams,
    InvitationParams,
    TgAccountParams,
    UserParams,
    VideoParams,
} from "@/lib/tanstack/listDefaults";

export const blogKeys = {
    all: ["blogs"] as const,
    lists: () => [...blogKeys.all, "list"] as const,
    list: (params: BlogParams) =>
        [...blogKeys.lists(), params] as const,
};

export const invitationKeys = {
    all: ["admin-invitations"] as const,
    lists: () => [...invitationKeys.all, "list"] as const,
    list: (params: InvitationParams) =>
        [...invitationKeys.lists(), params] as const,
};

export const videoKeys = {
    all: ["videos"] as const,
    lists: () => [...videoKeys.all, "list"] as const,
    list: (params: VideoParams) =>
        [...videoKeys.lists(), params] as const,
};

export const imageKeys = {
    all: ["images"] as const,
    lists: () => [...imageKeys.all, "list"] as const,
    list: (params: ImageParams) => [...imageKeys.lists(), params] as const,
};

export const adminKeys = {
    all: ["admins"] as const,
    lists: () => [...adminKeys.all, "list"] as const,
    list: (params: AdminParams) => [...adminKeys.lists(), params] as const,
};

export const adminSessionKeys = {
    all: (adminId: string) => ["admin-sessions", adminId] as const,
};

export const userKeys = {
    all: ["users"] as const,
    lists: () => [...userKeys.all, "list"] as const,
    list: (params: UserParams) => [...userKeys.lists(), params] as const,
};

export const userSessionKeys = {
    all: (userId: string) => ["user-sessions", userId] as const,
};

export const tgAccountKeys = {
    all: ["tg-accounts"] as const,
    lists: () => [...tgAccountKeys.all, "list"] as const,
    list: (params: TgAccountParams) => [...tgAccountKeys.lists(), params] as const,
};

export const broadcastKeys = {
    all: (accountId: string) => ["broadcast", accountId] as const,
    detail: (accountId: string) => [...broadcastKeys.all(accountId), "detail"] as const,
    progress: (accountId: string) => [...broadcastKeys.all(accountId), "progress"] as const,
    recipients: (accountId: string, params: object) =>
        [...broadcastKeys.all(accountId), "recipients", params] as const,
    history: (accountId: string) => [...broadcastKeys.all(accountId), "history"] as const,
    runRecipients: (runId: string, params: object) =>
        ["broadcast-run-recipients", runId, params] as const,
    channelSearch: (accountId: string, query: string) =>
        [...broadcastKeys.all(accountId), "channel-search", query] as const,
};
