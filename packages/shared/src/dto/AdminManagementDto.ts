import { ImageDto } from "./ImageDto";

export type AdminManagementDto = {
    id: string;
    email: string;
    status: "ACTIVE" | "BLOCKED";
    note: string | null;
    createdAt: string;
    lastSeenAt: string | null;
    lastLoginAt: string | null;
    activeSessions: number;
    avatar: ImageDto | null;
};
