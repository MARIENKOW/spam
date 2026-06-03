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

export interface TgAccountQrStartResponseDto {
    sessionId: string;
    qrDataUrl: string;
    tokenExpiresAt: number;
}

export type TgAccountQrStatus = "pending" | "needs2fa" | "success" | "expired";

export interface TgAccountQrPollResponseDto {
    status: TgAccountQrStatus;
    qrDataUrl?: string;
    tokenExpiresAt?: number;
    account?: TgAccountDto | null;
}

export interface TgAccountQrVerify2faResponseDto {
    account: TgAccountDto;
}
