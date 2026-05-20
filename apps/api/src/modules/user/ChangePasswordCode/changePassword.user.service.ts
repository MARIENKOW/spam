import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from "@nestjs/common";

import {
    ChangePasswordCodeStatus,
    ChangePasswordCodeUser,
    User,
} from "@/generated/prisma";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";
import { MailerService } from "@/infrastructure/mailer/mailer.service";
import { OtpService } from "@/infrastructure/otp/otp.service";
import { HashService } from "@/infrastructure/hash/hash.service";
import {
    ChangePasswordCodeUserDtoOutput,
    ChangePasswordSettingsUserDtoOutput,
    ChangePasswordUserDtoOutput,
    CHANGE_PASSWORD_OTP_LENGTH,
} from "@myorg/shared/form";
import { ValidationException } from "@/common/exception/validation.exception";
import { I18nService } from "nestjs-i18n";
import { MessageStructure } from "@myorg/shared/i18n";
import { ChangePasswordStatus, MailSendSuccess } from "@myorg/shared/dto";
import i18nFormatDuration from "@/lib/i18n/i18nFormatDuration";

// ── Конфигурация ──────────────────────────────────────────────────────────────

export const CHANGE_PASSWORD_CONFIG = {
    expires: 15 * 60 * 1000,
    resendCooldown: 60 * 1000,
    maxResends: 3,
    maxOtpAttempts: 3,
    blockDuration: 60 * 60 * 1000,
    passwordChangeCooldown: 5 * 60 * 60 * 1000,
} as const;

// ── Сервис ────────────────────────────────────────────────────────────────────

@Injectable()
export class ChangePasswordUserService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly otpService: OtpService,
        private readonly mailService: MailerService,
        private readonly hash: HashService,
        private readonly i18n: I18nService<MessageStructure>,
    ) {}

    private readonly cfg = CHANGE_PASSWORD_CONFIG;

    // ── Утилиты блокировки ────────────────────────────────────────────────────

    private getBlockedUntil(blockedAt: Date): Date {
        return new Date(blockedAt.getTime() + this.cfg.blockDuration);
    }

    private isStillBlocked(blockedAt: Date | null): blockedAt is Date {
        if (!blockedAt) return false;
        return this.getBlockedUntil(blockedAt) > new Date();
    }

    private throwBlocked(blockedAt: Date): never {
        throw new ValidationException({
            root: [
                {
                    message: this.i18n.t("features.changePassword.blocked", {
                        args: {
                            time: i18nFormatDuration(
                                this.getBlockedUntil(blockedAt).getTime() -
                                    Date.now(),
                            ),
                        },
                    }),
                    type: "error",
                },
            ],
        });
    }

    // ── Утилиты cooldown после смены ──────────────────────────────────────────

    private getPasswordChangeAvailableAt(user: User): Date | null {
        if (!user.passwordChangedAt) return null;
        return new Date(
            user.passwordChangedAt.getTime() + this.cfg.passwordChangeCooldown,
        );
    }

    private calcPasswordChangeCooldown(user: User): { until: string } | null {
        const availableAt = this.getPasswordChangeAvailableAt(user);
        if (!availableAt) return null;
        return availableAt > new Date() ? { until: availableAt.toISOString() } : null;
    }

    private checkPasswordChangeCooldown(user: User): void {
        const availableAt = this.getPasswordChangeAvailableAt(user);
        if (!availableAt) return;
        const remaining = availableAt.getTime() - Date.now();
        if (remaining > 0) {
            throw new ValidationException({
                root: [
                    {
                        message: this.i18n.t(
                            "features.changePassword.changeCooldown",
                            {
                                args: {
                                    time: i18nFormatDuration(remaining),
                                },
                            },
                        ),
                        type: "error",
                    },
                ],
            });
        }
    }

    // ── Статус ────────────────────────────────────────────────────────────────

    async getStatus(user: User): Promise<ChangePasswordStatus> {
        const cooldown = this.calcPasswordChangeCooldown(user);
        const token = await this.getToken(user.id);
        const withoutPassword = !user.passwordHash;
        const empty: ChangePasswordStatus = {
            cooldown,
            withoutPassword,
            pending: null,
            blocked: null,
        };

        if (!token || cooldown) return empty;

        // SUCCESS и истёкший — сразу empty
        if (
            token.status === ChangePasswordCodeStatus.SUCCESS ||
            token.expiresAt < new Date()
        )
            return empty;

        if (token.status === ChangePasswordCodeStatus.BLOCKED) {
            if (!this.isStillBlocked(token.blockedAt)) return empty;
            return {
                withoutPassword,
                pending: null,
                cooldown: null,
                blocked: { until: this.getBlockedUntil(token.blockedAt).toISOString() },
            };
        }

        // PENDING
        return {
            withoutPassword,
            pending: {
                email: user.email,
                expiresAt: token.expiresAt.toISOString(),
                cooldownUntil: this.calcResendCooldown(token),
            },
            blocked: null,
            cooldown: null,
        };
    }

    // ── Инициация (есть пароль) ───────────────────────────────────────────────

    async initiate(
        user: User,
        dto: ChangePasswordSettingsUserDtoOutput,
    ): Promise<MailSendSuccess> {
        if (!user.passwordHash) {
            throw new InternalServerErrorException();
        }

        this.checkPasswordChangeCooldown(user);

        const { blocked, pending } = await this.checkBlockAndPending(user.id);
        if (blocked) this.throwBlocked(blocked);
        if (pending) return { email: user.email, ...pending };

        const isCurrentValid = await this.hash.compare(
            dto.currentPassword,
            user.passwordHash,
        );
        if (!isCurrentValid) {
            throw new ValidationException<ChangePasswordSettingsUserDtoOutput>({
                fields: { currentPassword: ["form.currentPassword.invalid"] },
            });
        }

        const { code, token } = await this.createToken(
            user.id,
            dto.newPassword,
        );
        await this.sendCodeOrRollback(user.id, user.email, code);

        return {
            email: user.email,
            expiresAt: this.makeExpiresAt().toISOString(),
            cooldownUntil:
                token.resendCount >= this.cfg.maxResends
                    ? null
                    : new Date(Date.now() + this.cfg.resendCooldown).toISOString(),
        };
    }

    // ── Инициация (нет пароля — OAuth юзер) ──────────────────────────────────

    async initiateWithoutPassword(
        user: User,
        dto: ChangePasswordUserDtoOutput,
    ): Promise<MailSendSuccess> {
        if (user.passwordHash) {
            throw new InternalServerErrorException();
        }

        this.checkPasswordChangeCooldown(user);

        const { blocked, pending } = await this.checkBlockAndPending(user.id);
        if (blocked) this.throwBlocked(blocked);
        if (pending) return { email: user.email, ...pending };

        const { code, token } = await this.createToken(user.id, dto.password);
        await this.sendCodeOrRollback(user.id, user.email, code);

        return {
            email: user.email,
            expiresAt: this.makeExpiresAt().toISOString(),
            cooldownUntil:
                token.resendCount >= this.cfg.maxResends
                    ? null
                    : new Date(Date.now() + this.cfg.resendCooldown).toISOString(),
        };
    }

    // ── Подтверждение ─────────────────────────────────────────────────────────

    async confirm(
        userId: string,
        dto: ChangePasswordCodeUserDtoOutput,
    ): Promise<void> {
        const token = await this.prisma.changePasswordCodeUser.findFirst({
            where: {
                userId,
                status: ChangePasswordCodeStatus.PENDING,
                expiresAt: { gt: new Date() },
                attempts: { lt: this.cfg.maxOtpAttempts },
            },
        });
        if (!token) throw new NotFoundException();

        const isValid = this.hash.verifySha256(dto.code, token.codeHash);

        if (!isValid) {
            const newAttempts = token.attempts + 1;
            const isNowBlocked = newAttempts >= this.cfg.maxOtpAttempts;
            const blockedAt = isNowBlocked ? new Date() : null;

            await this.prisma.changePasswordCodeUser.update({
                where: { userId },
                data: {
                    attempts: { increment: 1 },
                    ...(isNowBlocked && {
                        status: ChangePasswordCodeStatus.BLOCKED,
                        blockedAt,
                    }),
                },
            });

            if (isNowBlocked) {
                throw new ValidationException({
                    root: [
                        {
                            message: this.i18n.t(
                                "features.changePassword.code.blocked",
                                {
                                    args: {
                                        time: i18nFormatDuration(
                                            this.getBlockedUntil(
                                                blockedAt!,
                                            ).getTime() - Date.now(),
                                        ),
                                    },
                                },
                            ),
                            data: { return: true },
                            type: "error",
                        },
                    ],
                });
            }

            throw new ValidationException({
                root: [
                    {
                        message: this.i18n.t(
                            "features.changePassword.code.invalid",
                            {
                                args: {
                                    count:
                                        this.cfg.maxOtpAttempts - newAttempts,
                                },
                            },
                        ),
                        type: "error",
                    },
                ],
            });
        }

        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: userId },
                data: {
                    passwordHash: token.newPasswordHash,
                    passwordChangedAt: new Date(),
                },
            }),
            this.prisma.sessionUser.deleteMany({ where: { userId } }),
            this.prisma.changePasswordCodeUser.update({
                where: { userId },
                data: { status: ChangePasswordCodeStatus.SUCCESS },
            }),
        ]);
    }

    // ── Повторная отправка ────────────────────────────────────────────────────

    async resend(user: User): Promise<MailSendSuccess> {
        const token = await this.getActivePending(user.id);

        if (token.resendCount >= this.cfg.maxResends) {
            throw new ValidationException({
                root: [
                    {
                        message: this.i18n.t(
                            "features.changePassword.resend.limit",
                        ),
                        type: "error",
                    },
                ],
            });
        }

        if (token.lastResendAt) {
            const cooldownEnd = new Date(
                token.lastResendAt.getTime() + this.cfg.resendCooldown,
            );
            if (new Date() < cooldownEnd) {
                throw new ValidationException({
                    root: [
                        {
                            message: this.i18n.t(
                                "features.changePassword.resend.cooldown",
                                {
                                    args: {
                                        time: i18nFormatDuration(
                                            cooldownEnd.getTime() - Date.now(),
                                        ),
                                    },
                                },
                            ),
                            type: "error",
                            data: {
                                time: cooldownEnd.getTime() - Date.now(),
                            },
                        },
                    ],
                });
            }
        }

        const { code, codeHash } = this.generateCode();

        await this.prisma.changePasswordCodeUser.update({
            where: { userId: user.id },
            data: {
                codeHash,
                expiresAt: this.makeExpiresAt(),
                attempts: 0,
                resendCount: { increment: 1 },
                lastResendAt: new Date(),
            },
        });

        try {
            await this.mailService.sendChangePasswordCode({
                to: user.email,
                code,
                expires: this.cfg.expires,
            });
        } catch (error) {
            await this.prisma.changePasswordCodeUser.update({
                where: { userId: user.id },
                data: {
                    codeHash: token.codeHash,
                    expiresAt: token.expiresAt,
                    attempts: token.attempts,
                    resendCount: token.resendCount,
                    lastResendAt: token.lastResendAt,
                },
            });
            throw error;
        }

        return {
            email: user.email,
            expiresAt: this.makeExpiresAt().toISOString(),
            cooldownUntil:
                token.resendCount + 1 >= this.cfg.maxResends
                    ? null
                    : new Date(Date.now() + this.cfg.resendCooldown).toISOString(),
        };
    }

    // ── Отмена ────────────────────────────────────────────────────────────────

    async cancel(userId: string): Promise<void> {
        await this.getActivePending(userId);
        await this.prisma.changePasswordCodeUser.delete({
            where: { userId },
        });
    }

    // ── Private: блокировка + pending (один запрос) ───────────────────────────

    private async checkBlockAndPending(userId: string): Promise<{
        blocked: Date | null;
        pending: Omit<MailSendSuccess, "email"> | null;
    }> {
        const token = await this.getToken(userId);

        if (
            token?.status === ChangePasswordCodeStatus.BLOCKED &&
            this.isStillBlocked(token.blockedAt)
        ) {
            return { blocked: token.blockedAt, pending: null };
        }

        if (
            token?.status === ChangePasswordCodeStatus.PENDING &&
            token.expiresAt > new Date()
        ) {
            return {
                blocked: null,
                pending: {
                    expiresAt: token.expiresAt.toISOString(),
                    cooldownUntil: this.calcResendCooldown(token),
                },
            };
        }

        return { blocked: null, pending: null };
    }

    // ── Private: токен ────────────────────────────────────────────────────────

    private calcResendCooldown(token: ChangePasswordCodeUser): string | null {
        if (token.resendCount >= this.cfg.maxResends) return null;

        const cooldownEnd = (token.lastResendAt?.getTime() ?? 0) + this.cfg.resendCooldown;
        return cooldownEnd > Date.now() ? new Date(cooldownEnd).toISOString() : null;
    }

    private async createToken(
        userId: string,
        newPassword: string,
    ): Promise<{ code: string; token: ChangePasswordCodeUser }> {
        const { code, codeHash } = this.generateCode();
        const newPasswordHash = await this.hash.hash(newPassword);

        const token = await this.prisma.changePasswordCodeUser.upsert({
            where: { userId },
            create: {
                userId,
                codeHash,
                newPasswordHash,
                expiresAt: this.makeExpiresAt(),
                lastResendAt: new Date(),
            },
            update: {
                codeHash,
                newPasswordHash,
                expiresAt: this.makeExpiresAt(),
                status: ChangePasswordCodeStatus.PENDING,
                attempts: 0,
                resendCount: 0,
                blockedAt: null,
                lastResendAt: new Date(),
            },
        });

        return { code, token };
    }

    private getToken(userId: string): Promise<ChangePasswordCodeUser | null> {
        return this.prisma.changePasswordCodeUser.findUnique({
            where: { userId },
        });
    }

    private async getActivePending(
        userId: string,
    ): Promise<ChangePasswordCodeUser> {
        const token = await this.getToken(userId);

        if (
            !token ||
            token.status !== ChangePasswordCodeStatus.PENDING ||
            token.expiresAt < new Date()
        ) {
            throw new NotFoundException();
        }

        return token;
    }

    private generateCode(): { code: string; codeHash: string } {
        const code = this.otpService.generate({
            length: CHANGE_PASSWORD_OTP_LENGTH,
        });
        return { code, codeHash: this.hash.sha256(code) };
    }

    private makeExpiresAt(): Date {
        return new Date(Date.now() + this.cfg.expires);
    }

    // ── Private: отправка ─────────────────────────────────────────────────────

    private async sendCodeOrRollback(
        userId: string,
        email: string,
        code: string,
    ): Promise<void> {
        try {
            await this.mailService.sendChangePasswordCode({
                to: email,
                code,
                expires: this.cfg.expires,
            });
        } catch (error) {
            await this.prisma.changePasswordCodeUser.delete({
                where: { userId },
            });
            throw error;
        }
    }

    // ── Private: утилиты ──────────────────────────────────────────────────────

    private maskEmail(email: string): string {
        const [local, domain] = email.split("@");
        return `${local.slice(0, 2)}***@${domain}`;
    }
}
