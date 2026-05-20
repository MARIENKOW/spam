import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from "@nestjs/common";
import { AdminService } from "@/modules/admin/admin.service";
import {
    ChangePasswordAdminDtoOutput,
    ForgotPasswordAdminDtoOutput,
    LoginAdminDtoOutput,
} from "@myorg/shared/form";
import { ValidationException } from "@/common/exception/validation.exception";
import { MessageStructure } from "@myorg/shared/i18n";
import { I18nService } from "nestjs-i18n";
import { HashService } from "@/infrastructure/hash/hash.service";
import { RequestContextService } from "@/common/request-context/request-context.service";
import { OAuth2Client } from "google-auth-library";
import { SessionAdminService } from "@/modules/auth/admin/session/session.admin.service";
import { MailerService } from "@/infrastructure/mailer/mailer.service";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";
import { env } from "@/config";
import { ResetPasswordTokenAdminService } from "@/modules/auth/admin/resetPasswordToken/reset.password.token.admin.service";
import i18nFormatDuration from "@/lib/i18n/i18nFormatDuration";

@Injectable()
export class AuthAdminService {
    private readonly oauthClient: OAuth2Client;

    constructor(
        private readonly admin: AdminService,
        private readonly session: SessionAdminService,
        private readonly resetToken: ResetPasswordTokenAdminService,
        private readonly i18n: I18nService<MessageStructure>,
        private readonly hash: HashService,
        private readonly context: RequestContextService,
        private readonly mailer: MailerService,
    ) {
        this.oauthClient = new OAuth2Client(
            env.GOOGLE_CLIENT_ID,
            env.GOOGLE_CLIENT_SECRET,
        );
    }

    async login(
        body: LoginAdminDtoOutput,
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const { email, password } = body;

        const admin = await this.admin.findByEmail(email);
        if (!admin) {
            throw new ValidationException<LoginAdminDtoOutput>({
                fields: { email: ["form.email.notFound"] },
            });
        }

        if (!admin.passwordHash) {
            throw new ValidationException<LoginAdminDtoOutput>({
                root: [
                    {
                        message: this.i18n.t(
                            "pages.login.feedback.errors.passwordNotFound",
                            {
                                args: {
                                    btn: this.i18n.t(
                                        "pages.forgotPassword.name",
                                    ),
                                },
                            },
                        ),
                        type: "error",
                    },
                ],
            });
        }

        const isValid = await this.hash.compare(password, admin.passwordHash);
        if (!isValid) {
            throw new ValidationException<LoginAdminDtoOutput>({
                fields: { password: ["form.password.invalid"] },
            });
        }

        if (admin.status === "BLOCKED") {
            throw new ValidationException<LoginAdminDtoOutput>({
                root: [{ message: this.i18n.t("pages.login.feedback.errors.blocked"), type: "error" }],
            });
        }

        return this.session.create({ adminId: admin.id });
    }

    async google({
        code,
    }: {
        code: string;
    }): Promise<{ accessToken: string; refreshToken: string }> {
        const { tokens } = await this.oauthClient.getToken({
            code,
            redirect_uri: "postmessage",
        });

        if (!tokens.id_token) throw new InternalServerErrorException();

        const ticket = await this.oauthClient.verifyIdToken({
            idToken: tokens.id_token,
            audience: env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload?.email) throw new InternalServerErrorException();

        const admin = await this.admin.findByEmail(payload.email);
        if (!admin) throw new NotFoundException();

        if (admin.status === "BLOCKED") {
            throw new ValidationException({
                root: [{ message: this.i18n.t("pages.login.feedback.errors.blocked"), type: "error" }],
            });
        }

        if (payload.picture && !admin.avatarId) {
            await this.admin.saveOauthImage({
                adminId: admin.id,
                url: payload.picture,
            });
        }

        return this.session.create({ adminId: admin.id });
    }

    async refresh(
        refreshTokenAdmin: string,
    ): Promise<{ accessTokenAdmin: string; refreshTokenAdmin: string }> {
        const { accessToken, refreshToken } =
            await this.session.refresh(refreshTokenAdmin);
        return {
            accessTokenAdmin: accessToken,
            refreshTokenAdmin: refreshToken,
        };
    }

    async forgotPassword({
        email,
    }: ForgotPasswordAdminDtoOutput): Promise<string> {
        const admin = await this.admin.findByEmail(email);
        if (!admin) {
            throw new ValidationException<ForgotPasswordAdminDtoOutput>({
                fields: { email: ["form.email.notFound"] },
            });
        }

        if (admin.status === "BLOCKED") {
            throw new ValidationException<ForgotPasswordAdminDtoOutput>({
                root: [{ message: this.i18n.t("pages.login.feedback.errors.blocked"), type: "error" }],
            });
        }

        const existing = await this.resetToken.isHaveAdminToken(admin);
        if (existing) {
            throw new ValidationException({
                root: [
                    {
                        message: this.i18n.t(
                            "pages.forgotPassword.feedback.errors.alreadySent",
                            {
                                args: {
                                    time: i18nFormatDuration(
                                        existing.expiresAt.getTime() -
                                            Date.now(),
                                    ),
                                },
                            },
                        ),
                        type: "error",
                    },
                ],
            });
        }

        const { token, id } = await this.resetToken.create(admin.id);
        const url = `${this.context.origin}${FULL_PATH_ROUTE.admin.changePasssword.path}?token=${encodeURIComponent(token)}`;

        try {
            await this.mailer.sendForgotPassword({
                to: admin.email,
                expires: this.resetToken.expires,
                url,
            });
        } catch (error) {
            await this.resetToken.delete(id);
            throw error;
        }

        return this.i18n.t("pages.forgotPassword.feedback.success", {
            args: {
                time: i18nFormatDuration(this.resetToken.expires),
            },
        });
    }

    async changePassword(
        { password }: ChangePasswordAdminDtoOutput,
        { token }: { token: string },
    ): Promise<true> {
        const decoded = decodeURIComponent(token);

        let payload: { adminId: string };
        try {
            payload = this.resetToken.verifyToken(decoded);
        } catch {
            throw new NotFoundException();
        }

        const admin = await this.admin.findById(payload.adminId);
        if (!admin || admin.status === "BLOCKED") throw new NotFoundException();

        const tokenData = await this.resetToken.findByAdminId(admin.id);
        if (!tokenData) throw new NotFoundException();

        const isValid = this.hash.verifySha256(decoded, tokenData.tokenHash); // ← был баг: token вместо decoded
        if (!isValid) throw new NotFoundException();

        if (this.resetToken.isExpireToken(tokenData)) {
            throw new ValidationException({
                root: [
                    {
                        message: this.i18n.t(
                            "pages.forgotPassword.changePassword.feedback.errors.timeout",
                        ),
                        type: "error",
                        data: { isShowButton: true },
                    },
                ],
            });
        }

        await this.admin.changePassword({ password, id: admin.id });
        await this.resetToken.deleteByAdminId(admin.id);
        await this.session.deleteAllByAdminId(admin.id);
        return true;
    }

    async logout(sessionId: string): Promise<void> {
        return this.session.delete(sessionId);
    }
}
