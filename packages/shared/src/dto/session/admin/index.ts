import { SessionViewDto } from "..";

export type SessionAdminDto = {
    id: string;
    userAgent: string | null;
    ip: string | null;
    createdAt: Date;
    lastUsedAt: Date;
};

export interface SessionAdminViewDto extends SessionViewDto {}
