import { SessionViewDto } from "..";

export type SessionUserDto = {
    id: string;
    userAgent: string | null;
    ip: string | null;
    createdAt: Date;
    lastUsedAt: Date;
};

export interface SessionUserViewDto extends SessionViewDto {}
