export type MailSendSuccess = {
    email: string;
    expiresAt: string;
    cooldownUntil: string | null;
};

export type ChangePasswordStatus = {
    withoutPassword: boolean;
    pending: MailSendSuccess | null;
    blocked: { until: string } | null;
    cooldown: { until: string } | null;
};
