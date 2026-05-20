import { ImageDto } from "./ImageDto";

export type UserManagementDto = {
    id: string;
    email: string;
    status: "ACTIVE" | "NOACTIVE" | "BLOCKED";
    note: string | null;
    createdAt: string;
    lastSeenAt: string | null;
    lastLoginAt: string | null;
    activeSessions: number;
    avatar: ImageDto | null;
};
