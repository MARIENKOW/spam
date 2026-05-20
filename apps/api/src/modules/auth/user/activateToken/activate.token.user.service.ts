import { ActivateTokenUser, User } from "@/generated/prisma";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { HashService } from "@/infrastructure/hash/hash.service";
import { env } from "@/config";

export type ActivateTokenUserPayload = { userId: string };

@Injectable()
export class ActivateTokenUserService {
    constructor(
        private prisma: PrismaService,
        private hash: HashService,
        private jwt: JwtService,
    ) {}
    expires = 30 * 60 * 1000; //30 мин

    async isHaveUserToken(userData: User): Promise<ActivateTokenUser | null> {
        const activateToken = await this.findByUserId(userData.id);
        if (!activateToken) return null;
        const isExpire = await this.isExpireAndDelete(activateToken);
        if (isExpire) return null;
        return activateToken;
    }
    async findByUserId(userId: string): Promise<ActivateTokenUser | null> {
        return this.prisma.activateTokenUser.findUnique({
            where: { userId },
        });
    }
    async findById(id: string): Promise<ActivateTokenUser | null> {
        return this.prisma.activateTokenUser.findUnique({
            where: { id },
        });
    }
    private createToken(payload: ActivateTokenUserPayload): string {
        return this.jwt.sign(payload, {
            secret: env.JWT_SECRET,
        });
    }
    verifyToken(token: string): ActivateTokenUserPayload {
        return this.jwt.verify(token, {
            secret: env.JWT_SECRET,
        });
    }
    isExpireToken(model: ActivateTokenUser): boolean {
        const time = model.expiresAt.getTime() - new Date().getTime();
        if (time <= 0) return true;
        return false;
    }
    async isExpireAndDelete(
        activateToken: ActivateTokenUser,
    ): Promise<boolean> {
        const isExpire = this.isExpireToken(activateToken);
        if (isExpire) {
            await this.delete(activateToken.id);
        }
        return isExpire;
    }

    async create(
        userId: string,
    ): Promise<ActivateTokenUser & { token: string; expires: number }> {
        const token = this.createToken({ userId });
        const tokenHash = this.hash.sha256(token);
        const data = await this.prisma.activateTokenUser.create({
            data: {
                userId,
                expiresAt: new Date(Date.now() + this.expires),
                tokenHash,
            },
        });

        return { ...data, token, expires: this.expires };
    }
    async delete(id: string): Promise<true> {
        await this.prisma.activateTokenUser.delete({ where: { id } });
        return true;
    }
    async deleteByUserId(userId: string): Promise<true> {
        await this.prisma.activateTokenUser.delete({ where: { userId } });
        return true;
    }
}
