import { SessionUser, User } from "@/generated/prisma";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import {
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common";
import * as crypto from "crypto";
import { HashService } from "@/infrastructure/hash/hash.service";
import { env } from "@/config";
import { RequestContextService } from "@/common/request-context/request-context.service";
import { mapSessionUserView } from "@/modules/auth/user/session/session.user.mapper";
import { SessionUserViewDto } from "@myorg/shared/dto";

export type AccessTokenUserPayload = { userId: string; sessionId: string };
export type RefreshTokenUserPayload = { userId: string; sessionId: string };
@Injectable()
export class SessionUserService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private hash: HashService,
        private requestContext: RequestContextService,
    ) {}

    private ACCESS_TOKEN_EXPIRES = 10;
    private REFRESH_TOKEN_EXPIRES = 30 * 24 * 60 * 60;

    async getMe(
        user: User,
        currentSessionId: string,
    ): Promise<SessionUserViewDto[]> {
        const sessions = await this.prisma.sessionUser.findMany({
            where: { userId: user.id },
            orderBy: { lastUsedAt: "desc" }, // текущая скорее всего первой
        });

        return sessions.map((s) => mapSessionUserView(s, currentSessionId));
    }

    findById(id: string): Promise<SessionUser | null> {
        return this.prisma.sessionUser.findUnique({
            where: { id },
        });
    }
    deleteAllByUserId(userId: string): Promise<{ count: number }> {
        return this.prisma.sessionUser.deleteMany({ where: { userId } });
    }
    async touch(id: string): Promise<Date> {
        const lastUsedAt = new Date();
        const session = await this.prisma.sessionUser.update({
            where: { id },
            data: { lastUsedAt },
        });
        await this.prisma.user.update({
            where: { id: session.userId },
            data: { lastSeenAt: lastUsedAt },
        });
        return lastUsedAt;
    }
    private createId(): string {
        return crypto.randomBytes(32).toString("hex");
    }
    normalizeIp(ip: string): string {
        if (ip.startsWith("::ffff:")) {
            return ip.replace("::ffff:", "");
        }
        return ip;
    }
    private generateAccessToken(playload: AccessTokenUserPayload): string {
        return this.jwt.sign(playload, {
            secret: env.JWT_ACCESS_SECRET,
            expiresIn: this.ACCESS_TOKEN_EXPIRES,
        });
    }

    verifyAccessToken(accessTokenUser: string): AccessTokenUserPayload {
        return this.jwt.verify(accessTokenUser, {
            secret: env.JWT_ACCESS_SECRET,
        });
    }
    private generateRefreshToken(playload: AccessTokenUserPayload): string {
        return this.jwt.sign(playload, {
            secret: env.JWT_REFRESH_SECRET,
            expiresIn: this.REFRESH_TOKEN_EXPIRES,
        });
    }
    verifyRefreshToken(refreshTokenUser: string): AccessTokenUserPayload {
        return this.jwt.verify(refreshTokenUser, {
            secret: env.JWT_REFRESH_SECRET,
        });
    }
    async refresh(refreshTokenUser: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }> {
        let payload: RefreshTokenUserPayload;
        try {
            payload = this.verifyRefreshToken(refreshTokenUser);
        } catch (error) {
            throw new UnauthorizedException();
        }
        const sessionData = await this.findById(payload.sessionId);
        if (!sessionData) throw new UnauthorizedException();

        const user = await this.prisma.user.findUnique({ where: { id: sessionData.userId } });
        if (!user || user.status !== "ACTIVE") throw new UnauthorizedException();

        // Проверяем текущий токен
        const isValid = this.hash.verifySha256(
            refreshTokenUser,
            sessionData.refreshTokenHash,
        );

        if (!isValid) {
            // Проверяем предыдущий токен (grace period)
            const isPreviousValid =
                sessionData.previousRefreshTokenHash &&
                sessionData.previousTokenExpiresAt &&
                sessionData.previousTokenExpiresAt > new Date() &&
                this.hash.verifySha256(
                    refreshTokenUser,
                    sessionData.previousRefreshTokenHash,
                );

            if (!isPreviousValid) throw new UnauthorizedException();
        }

        const accessToken = this.generateAccessToken({
            userId: sessionData.userId,
            sessionId: sessionData.id,
        });
        const refreshToken = this.generateRefreshToken({
            userId: sessionData.userId,
            sessionId: sessionData.id,
        });

        const refreshTokenHash = this.hash.sha256(refreshToken);

        await this.prisma.sessionUser.update({
            where: { id: sessionData.id },
            data: {
                refreshTokenHash,
                expiresAt: new Date(
                    Date.now() + this.REFRESH_TOKEN_EXPIRES * 1000,
                ),
                previousRefreshTokenHash: sessionData.refreshTokenHash, // старый становится previous
                previousTokenExpiresAt: new Date(Date.now() + 30 * 1000), // живёт 30 секунд
                lastUsedAt: new Date(),
            },
        });

        return { accessToken, refreshToken };
    }
    async create({
        userId,
    }: {
        userId: string;
    }): Promise<{ accessToken: string; refreshToken: string }> {
        const id = this.createId();
        const refreshToken = this.generateRefreshToken({
            userId,
            sessionId: id,
        });
        const refreshTokenHash = this.hash.sha256(refreshToken);

        const now = new Date();
        await this.prisma.sessionUser.create({
            data: {
                userId,
                id,
                expiresAt: new Date(Date.now() + this.REFRESH_TOKEN_EXPIRES * 1000),
                refreshTokenHash,
                ip: this.requestContext.ip,
                userAgent: this.requestContext.userAgent,
                lastUsedAt: now,
            },
        });
        await this.prisma.user.update({
            where: { id: userId },
            data: { lastLoginAt: now, lastSeenAt: now },
        });

        const accessToken = this.generateAccessToken({
            userId,
            sessionId: id,
        });

        return { refreshToken, accessToken };
    }
    async revoke({
        sessionId,
        currentSession,
    }: {
        sessionId: string;
        currentSession: string;
    }): Promise<void> {
        if (sessionId === currentSession) throw new ForbiddenException();
        const data = await this.findById(sessionId);
        if (!data) throw new NotFoundException();
        await this.delete(sessionId);
    }
    async delete(sessionId: string): Promise<void> {
        await this.prisma.sessionUser.delete({ where: { id: sessionId } });
    }
}
