import { ResetPasswordTokenAdmin, Admin } from "@/generated/prisma";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";

import { AdminService } from "@/modules/admin/admin.service";
import { ValidationException } from "@/common/exception/validation.exception";
import { I18nService } from "nestjs-i18n";
import { MessageStructure } from "@myorg/shared/i18n";
import { HashService } from "@/infrastructure/hash/hash.service";
import { JwtService } from "@nestjs/jwt";
import { env } from "@/config";

export type RememberPasswordTokenAdminPayload = {
    adminId: string;
};
@Injectable()
export class ResetPasswordTokenAdminService {
    constructor(
        private prisma: PrismaService,
        private admin: AdminService,
        private hash: HashService,
        private jwt: JwtService,
        private i18n: I18nService<MessageStructure>,
    ) {}
    expires = 15 * 60 * 1000; //15 мин
    findByAdminId(adminId: string): Promise<ResetPasswordTokenAdmin | null> {
        return this.prisma.resetPasswordTokenAdmin.findUnique({
            where: { adminId },
        });
    }
    async isHaveAdminToken(
        admin: Admin,
    ): Promise<ResetPasswordTokenAdmin | null> {
        const resetTokenData = await this.findByAdminId(admin.id);
        if (!resetTokenData) return null;
        const isExpireToken = this.isExpireToken(resetTokenData);
        if (isExpireToken) {
            await this.delete(resetTokenData.id);
            return null;
        }
        return resetTokenData;
    }

    findById(id: string): Promise<ResetPasswordTokenAdmin | null> {
        return this.prisma.resetPasswordTokenAdmin.findUnique({
            where: { id },
        });
    }

    private createToken(payload: RememberPasswordTokenAdminPayload): string {
        return this.jwt.sign(payload, {
            secret: env.JWT_SECRET,
        });
    }
    verifyToken(token: string): RememberPasswordTokenAdminPayload {
        return this.jwt.verify(token, {
            secret: env.JWT_SECRET,
        });
    }
    isExpireToken(model: ResetPasswordTokenAdmin): boolean {
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
        const adminData = await this.admin.findById(payload.adminId);
        if (!adminData || adminData.status === "BLOCKED") throw new NotFoundException();
        const resetPasswordToken = await this.findByAdminId(adminData.id);
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
        adminId: string,
    ): Promise<ResetPasswordTokenAdmin & { token: string }> {
        const token = this.createToken({ adminId });
        const tokenHash = this.hash.sha256(token);
        const data = await this.prisma.resetPasswordTokenAdmin.create({
            data: {
                adminId,
                expiresAt: new Date(Date.now() + this.expires),
                tokenHash,
            },
        });

        return { ...data, token };
    }
    async delete(id: string): Promise<true> {
        await this.prisma.resetPasswordTokenAdmin.delete({ where: { id } });
        return true;
    }
    async deleteByAdminId(adminId: string): Promise<true> {
        await this.prisma.resetPasswordTokenAdmin.delete({
            where: { adminId },
        });
        return true;
    }
}
