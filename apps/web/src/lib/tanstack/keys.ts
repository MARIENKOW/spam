import type {
    AdminParams,
    BlogParams,
    ImageParams,
    InvitationParams,
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
