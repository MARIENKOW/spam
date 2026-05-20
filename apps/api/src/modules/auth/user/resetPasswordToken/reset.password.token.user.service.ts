import { ResetPasswordTokenUser, User } from "@/generated/prisma";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";
import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { UserService } from "@/modules/user/user.service";
import { ValidationException } from "@/common/exception/validation.exception";
import { I18nService } from "nestjs-i18n";
import { MessageStructure } from "@myorg/shared/i18n";
import { MailerService } from "@/infrastructure/mailer/mailer.service";
import { HashService } from "@/infrastructure/hash/hash.service";
import { JwtService } from "@nestjs/jwt";
import { env } from "@/config";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";
import { RequestContextService } from "@/common/request-context/request-context.service";

export type RememberPasswordTokenUserPayload = {
    userId: string;
};
@Injectable()
export class ResetPasswordTokenUserService {
    constructor(
        private prisma: PrismaService,
        private mailerService: MailerService,
        private user: UserService,
        private hash: HashService,
        private context: RequestContextService,
        private jwt: JwtService,
        private i18n: I18nService<MessageStructure>,
    ) {}
    expires = 15 * 60 * 1000; //15 мин
    findByUserId(userId: string): Promise<ResetPasswordTokenUser | null> {
        return this.prisma.resetPasswordTokenUser.findUnique({
            where: { userId },
        });
    }
    async isHaveUserToken(user: User): Promise<ResetPasswordTokenUser | null> {
        const resetTokenData = await this.findByUserId(user.id);
        if (!resetTokenData) return null;
        const isExpireToken = this.isExpireToken(resetTokenData);
        if (isExpireToken) {
            await this.delete(resetTokenData.id);
            return null;
        }
        return resetTokenData;
    }
    async createAndSend({
        user,
        url,
    }: {
        user: User;
        url: string;
    }): Promise<number> {
        const { token, id } = await this.create(user.id);
        try {
            await this.mailerService.sendForgotPassword({
                to: user.email,
                expires: this.expires,
                url,
            });
            return this.expires;
        } catch (error) {
            await this.delete(id);
            throw error;
        }
    }
    findById(id: string): Promise<ResetPasswordTokenUser | null> {
        return this.prisma.resetPasswordTokenUser.findUnique({
            where: { id },
        });
    }

    private createToken(payload: RememberPasswordTokenUserPayload): string {
        return this.jwt.sign(payload, {
            secret: env.JWT_SECRET,
        });
    }
    verifyToken(token: string): RememberPasswordTokenUserPayload {
        return this.jwt.verify(token, {
            secret: env.JWT_SECRET,
        });
    }
    isExpireToken(model: ResetPasswordTokenUser): boolean {
        const time = model.expiresAt.getTime() - new Date().getTime();
        if (time <= 0) return true;
        return false;
    }
    async check({ token }: { token: string }): Promise<true> {
        let payload;
        try {
            payload = this.verifyToken(decodeURIComponent(token));
        } catch (error) {
            throw new NotFoundException();
        }
        const userData = await this.user.findById(payload.userId);
        if (!userData || userData.status === "BLOCKED") throw new NotFoundException();
        const resetPasswordToken = await this.findByUserId(userData.id);
        if (!resetPasswordToken) throw new NotFoundException();
        const isValid = this.hash.verifySha256(
            token,
            resetPasswordToken.tokenHash,
        );
        if (!isValid) throw new NotFoundException();

        if (this.isExpireToken(resetPasswordToken))
            throw new ValidationException({
                root: [
                    {
                        message: this.i18n.t(
                            "pages.forgotPassword.changePassword.feedback.errors.timeout",
                        ),
                        type: "error",
                    },
                ],
            });

        return true;
    }
    async create(
        userId: string,
    ): Promise<ResetPasswordTokenUser & { token: string }> {
        const token = this.createToken({ userId });
        const tokenHash = this.hash.sha256(token);
        const data = await this.prisma.resetPasswordTokenUser.create({
            data: {
                userId,
                expiresAt: new Date(Date.now() + this.expires),
                tokenHash,
            },
        });

        return { ...data, token };
    }
    async delete(id: string): Promise<true> {
        await this.prisma.resetPasswordTokenUser.delete({ where: { id } });
        return true;
    }
    async deleteByUserId(userId: string): Promise<true> {
        await this.prisma.resetPasswordTokenUser.delete({ where: { userId } });
        return true;
    }
}
