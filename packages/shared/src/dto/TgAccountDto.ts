export type TgAccountStatus = "ACTIVE" | "INACTIVE" | "BANNED";

export interface TgAccountDto {
    id: string;
    phone: string;
    telegramId: string;
    firstName: string;
    lastName: string | null;
    username: string | null;
    photoUrl: string | null;
    isPremium: boolean;
    status: TgAccountStatus;
    createdAt: string;
    adminEmail: string;
    adminRole: "ADMIN" | "SUPERADMIN";
    broadcastStatus: "DRAFT" | "RUNNING" | "COMPLETED" | "STOPPED" | null;
    broadcastProgress: { sent: number; total: number } | null;
    broadcastRunCount: number;
}

export interface TgAccountStartResponseDto {
    phoneCodeHash: string;
}

export interface TgAccountVerifyResponseDto {
    requires2FA: boolean;
    account: TgAccountDto | null;
}
