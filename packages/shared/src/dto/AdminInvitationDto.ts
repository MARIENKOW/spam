export type AdminInvitationDto = {
    id: string;
    email: string;
    note: string | null;
    token: string;
    url: string;
    isExpired: boolean;
    isRevoked: boolean;
    expiresAt: string;
    revokedAt: string | null;
};
