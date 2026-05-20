import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from "@nestjs/common";
import { UserService } from "@/modules/user/user.service";
import {
    ChangePasswordUserDtoOutput,
    ForgotPasswordUserDtoOutput,
    LoginUserDtoOutput,
    RegisterUserDtoOutput,
} from "@myorg/shared/form";
import { ValidationException } from "@/common/exception/validation.exception";
import { MessageStructure } from "@myorg/shared/i18n";
import { I18nService } from "nestjs-i18n";
import { HashService } from "@/infrastructure/hash/hash.service";
import { RequestContextService } from "@/common/request-context/request-context.service";
import { OAuth2Client } from "google-auth-library";
import { SessionUserService } from "@/modules/auth/user/session/session.user.service";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";
import { MailerService } from "@/infrastructure/mailer/mailer.service";
import { env } from "@/config";
import { ActivateTokenUserService } from "@/modules/auth/user/activateToken/activate.token.user.service";
import { ResetPasswordTokenUserService } from "./resetPasswordToken/reset.password.token.user.service";
import i18nFormatDuration from "@/lib/i18n/i18nFormatDuration";

@Injectable()
export class AuthUserService {
    private readonly oauthClient: OAuth2Client;

    constructor(
        private readonly user: UserService,
        private readonly sessionUser: SessionUserService,
        private readonly resetToken: ResetPasswordTokenUserService,
        private readonly activateToken: ActivateTokenUserService,
        private readonly i18n: I18nService<MessageStructure>,
        private readonly hash: HashService,
        private readonly mailer: MailerService,
        private readonly context: RequestContextService,
    ) {
        this.oauthClient = new OAuth2Client(
            env.GOOGLE_CLIENT_ID,
            env.GOOGLE_CLIENT_SECRET,
        );
    }

    async register(body: RegisterUserDtoOutput): Promise<string> {
        const { password, email } = body;

        const existing = await this.user.findByEmail(email);
        if (existing) {
            throw new ValidationException<RegisterUserDtoOutput>({
                fields: { email: ["form.email.unique"] },
            });
        }

        const passwordHash = await this.hash.hash(password);
        const user = await this.user.create({
            updatedAt: new Date(),
            email,
            passwordHash,
        });

        if (user.status === "NOACTIVE") {
            await this.sendActivationEmail(user.id, user.email);
            return this.i18n.t("pages.register.feedback.success.mailSend", {
                args: {
                    time: i18nFormatDuration(this.activateToken.expires),
                },
            });
        }

        return this.i18n.t("pages.register.feedback.success.registerSuccess");
    }

    async login(
        body: LoginUserDtoOutput,
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const { email, password } = body;

        const user = await this.user.findByEmail(email);
        if (!user) {
            throw new ValidationException<LoginUserDtoOutput>({
                fields: { email: ["form.email.notFound"] },
            });
        }

        if (!user.passwordHash) {
            throw new ValidationException<LoginUserDtoOutput>({
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

        const isValid = await this.hash.compare(password, user.passwordHash);
        if (!isValid) {
            throw new ValidationException<LoginUserDtoOutput>({
                fields: { password: ["form.password.invalid"] },
            });
        }

        if (user.status === "BLOCKED") {
            throw new ValidationException<LoginUserDtoOutput>({
                root: [
                    {
                        message: this.i18n.t(
                            "pages.login.feedback.errors.blocked",
                        ),
                        type: "error",
                    },
                ],
            });
        }

        if (user.status === "NOACTIVE") {
            await this.throwActivationError(user.id);
        }

        return this.sessionUser.create({ userId: user.id });
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

        let user = await this.user.findByEmail(payload.email);

        if (!user) {
            user = await this.user.create({
                updatedAt: new Date(),
                status: "ACTIVE",
                email: payload.email,
            });
        }

        if (user.status === "BLOCKED") {
            throw new ValidationException({
                root: [
                    {
                        message: this.i18n.t(
                            "pages.login.feedback.errors.blocked",
                        ),
                        type: "error",
                    },
                ],
            });
        }

        if (user.status !== "ACTIVE") {
            await this.user.activate(user.id);
        }
        if (payload.picture && !user.avatarId) {
            await this.user.saveOauthImage({
                userId: user.id,
                url: payload.picture,
            });
        }

        return this.sessionUser.create({ userId: user.id });
    }

    async refresh(
        refreshTokenUser: string,
    ): Promise<{ accessTokenUser: string; refreshTokenUser: string }> {
        const { accessToken, refreshToken } =
            await this.sessionUser.refresh(refreshTokenUser);
        return { accessTokenUser: accessToken, refreshTokenUser: refreshToken };
    }

    async sendActivate({ email }: { email?: string }): Promise<string> {
        if (!email) throw new NotFoundException();

        const user = await this.user.findByEmail(email);
        if (!user) throw new NotFoundException();

        if (user.status === "BLOCKED") {
            throw new ValidationException({
                root: [
                    {
                        message: this.i18n.t("features.activate.error.blocked"),
                        type: "error",
                    },
                ],
            });
        }

        if (user.status === "ACTIVE") {
            throw new ValidationException({
                root: [
                    {
                        message: this.i18n.t(
                            "features.activate.error.alreadyActive",
                        ),
                        type: "info",
                    },
                ],
            });
        }

        const existing = await this.activateToken.isHaveUserToken(user);
        if (existing) {
            throw new ValidationException({
                root: [
                    {
                        message: this.i18n.t(
                            "features.activate.error.alreadySend",
                            {
                                args: {
                                    time: i18nFormatDuration(
                                        existing.expiresAt.getTime() -
                                            Date.now(),
                                    ),
                                },
                            },
                        ),
                        type: "info",
                    },
                ],
            });
        }

        const { expires } = await this.sendActivationEmail(user.id, user.email);
        return this.i18n.t("features.activate.success.sendSuccess", {
            args: {
                time: i18nFormatDuration(expires),
            },
        });
    }

    async activate({ token }: { token: string }): Promise<true> {
        const decoded = decodeURIComponent(token);

        let payload: { userId: string };
        try {
            payload = this.activateToken.verifyToken(decoded);
        } catch {
            throw new NotFoundException();
        }

        const user = await this.user.findById(payload.userId);
        if (!user || user.status !== "NOACTIVE") throw new NotFoundException();

        const tokenData = await this.activateToken.findByUserId(user.id);
        if (!tokenData) throw new NotFoundException();

        const isValid = this.hash.verifySha256(decoded, tokenData.tokenHash);
        if (!isValid) throw new NotFoundException();

        if (this.activateToken.isExpireToken(tokenData)) {
            throw new ValidationException({
                root: [
                    {
                        message: this.i18n.t(
                            "pages.activate.feedback.errors.expired",
                        ),
                        type: "error",
                        data: { isShowButton: true, email: user.email },
                    },
                ],
            });
        }

        await this.user.activate(user.id);
        await this.activateToken.deleteByUserId(user.id);
        return true;
    }

    async forgotPassword({
        email,
    }: ForgotPasswordUserDtoOutput): Promise<string> {
        const user = await this.user.findByEmail(email);
        if (!user) {
            throw new ValidationException<ForgotPasswordUserDtoOutput>({
                fields: { email: ["form.email.notFound"] },
            });
        }

        if (user.status === "BLOCKED") {
            throw new ValidationException<ForgotPasswordUserDtoOutput>({
                root: [{ message: this.i18n.t("pages.login.feedback.errors.blocked"), type: "error" }],
            });
        }

        const existing = await this.resetToken.isHaveUserToken(user);
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

        const { token, id } = await this.resetToken.create(user.id);
        const url = `${this.context.origin}${FULL_PATH_ROUTE.changePasssword.path}?token=${encodeURIComponent(token)}`;

        try {
            await this.mailer.sendForgotPassword({
                to: user.email,
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
        { password }: ChangePasswordUserDtoOutput,
        { token }: { token: string },
    ): Promise<true> {
        const decoded = decodeURIComponent(token);

        let payload: { userId: string };
        try {
            payload = this.resetToken.verifyToken(decoded);
        } catch {
            throw new NotFoundException();
        }

        const user = await this.user.findById(payload.userId);
        if (!user || user.status === "BLOCKED") throw new NotFoundException();

        const tokenData = await this.resetToken.findByUserId(user.id);
        if (!tokenData) throw new NotFoundException();

        const isValid = this.hash.verifySha256(decoded, tokenData.tokenHash);
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

        await this.user.changePassword({ password, id: user.id });
        await this.resetToken.deleteByUserId(user.id);
        await this.sessionUser.deleteAllByUserId(user.id);
        return true;
    }

    async logout(sessionId: string): Promise<void> {
        return this.sessionUser.delete(sessionId);
    }

    // Private helpers

    private async sendActivationEmail(userId: string, email: string) {
        const { expires, token, id } = await this.activateToken.create(userId);
        const url = `${this.context.origin}${FULL_PATH_ROUTE.activate.path}?token=${encodeURIComponent(token)}`;

        try {
            await this.mailer.sendActivateToken({ to: email, expires, url });
        } catch (error) {
            await this.activateToken.delete(id);
            throw error;
        }

        return { expires };
    }

    private async throwActivationError(userId: string): Promise<never> {
        const tokenData = await this.activateToken.findByUserId(userId);

        if (!tokenData) {
            throw new ValidationException({
                root: [
                    {
                        message: this.i18n.t(
                            "pages.login.feedback.errors.sendMail",
                        ),
                        type: "error",
                        data: { isShowButton: true },
                    },
                ],
            });
        }

        if (this.activateToken.isExpireToken(tokenData)) {
            throw new ValidationException({
                root: [
                    {
                        message: this.i18n.t(
                            "pages.login.feedback.errors.expire",
                        ),
                        type: "error",
                        data: { isShowButton: true },
                    },
                ],
            });
        }

        throw new ValidationException({
            root: [
                {
                    message: this.i18n.t(
                        "pages.login.feedback.errors.alreadySend",
                        {
                            args: {
                                time: i18nFormatDuration(
                                    tokenData.expiresAt.getTime() - Date.now(),
                                ),
                            },
                        },
                    ),
                    type: "error",
                },
            ],
        });
    }
}
