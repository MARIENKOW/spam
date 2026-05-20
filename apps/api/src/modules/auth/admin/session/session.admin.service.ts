import { Admin, SessionAdmin } from "@/generated/prisma";
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
import { SessionAdminDto, SessionAdminViewDto } from "@myorg/shared/dto";
import {
    mapSessionAdminView,
} from "@/modules/auth/admin/session/session.admin.mapper";

export type AccessTokenAdminPayload = { adminId: string; sessionId: string };
export type RefreshTokenAdminPayload = { adminId: string; sessionId: string };
@Injectable()
export class SessionAdminService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private hash: HashService,
        private requestContext: RequestContextService,
    ) {}

    private ACCESS_TOKEN_EXPIRES = 10;
    private REFRESH_TOKEN_EXPIRES = 30 * 24 * 60 * 60;

    async getMe(
        admin: Admin,
        currentSessionId: string,
    ): Promise<SessionAdminViewDto[]> {
        const sessions = await this.prisma.sessionAdmin.findMany({
            where: { adminId: admin.id },
            orderBy: { lastUsedAt: "desc" }, // текущая скорее всего первой
        });

        return sessions.map((s) => mapSessionAdminView(s, currentSessionId));
    }
    findById(id: string): Promise<SessionAdmin | null> {
        return this.prisma.sessionAdmin.findUnique({
            where: { id },
        });
    }
    deleteAllByAdminId(adminId: string): Promise<{ count: number }> {
        return this.prisma.sessionAdmin.deleteMany({ where: { adminId } });
    }
    async touch(id: string): Promise<Date> {
        const lastUsedAt = new Date();
        const session = await this.prisma.sessionAdmin.update({
            where: { id },
            data: { lastUsedAt },
        });
        await this.prisma.admin.update({
            where: { id: session.adminId },
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
    private generateAccessToken(playload: AccessTokenAdminPayload): string {
        return this.jwt.sign(playload, {
            secret: env.JWT_ACCESS_SECRET,
            expiresIn: this.ACCESS_TOKEN_EXPIRES,
        });
    }

    verifyAccessToken(accessTokenAdmin: string): AccessTokenAdminPayload {
        return this.jwt.verify(accessTokenAdmin, {
            secret: env.JWT_ACCESS_SECRET,
        });
    }
    private generateRefreshToken(playload: AccessTokenAdminPayload): string {
        return this.jwt.sign(playload, {
            secret: env.JWT_REFRESH_SECRET,
            expiresIn: this.REFRESH_TOKEN_EXPIRES,
        });
    }
    verifyRefreshToken(refreshTokenAdmin: string): AccessTokenAdminPayload {
        return this.jwt.verify(refreshTokenAdmin, {
            secret: env.JWT_REFRESH_SECRET,
        });
    }
    async refresh(refreshTokenAdmin: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }> {
        let payload: RefreshTokenAdminPayload;
        try {
            payload = this.verifyRefreshToken(refreshTokenAdmin);
        } catch (error) {
            throw new UnauthorizedException();
        }

        const sessionData = await this.findById(payload.sessionId);
        if (!sessionData) throw new UnauthorizedException();

        const admin = await this.prisma.admin.findUnique({ where: { id: sessionData.adminId } });
        if (!admin || admin.status !== "ACTIVE") throw new UnauthorizedException();

        // Проверяем текущий токен
        const isValid = this.hash.verifySha256(
            refreshTokenAdmin,
            sessionData.refreshTokenHash,
        );

        if (!isValid) {
            // Проверяем предыдущий токен (grace period)
            const isPreviousValid =
                sessionData.previousRefreshTokenHash &&
                sessionData.previousTokenExpiresAt &&
                sessionData.previousTokenExpiresAt > new Date() &&
                this.hash.verifySha256(
                    refreshTokenAdmin,
                    sessionData.previousRefreshTokenHash,
                );

            if (!isPreviousValid) throw new UnauthorizedException();
        }

        const accessToken = this.generateAccessToken({
            adminId: sessionData.adminId,
            sessionId: sessionData.id,
        });
        const refreshToken = this.generateRefreshToken({
            adminId: sessionData.adminId,
            sessionId: sessionData.id,
        });

        const refreshTokenHash = this.hash.sha256(refreshToken);

        await this.prisma.sessionAdmin.update({
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
        adminId,
    }: {
        adminId: string;
    }): Promise<{ accessToken: string; refreshToken: string }> {
        const id = this.createId();
        const refreshToken = this.generateRefreshToken({
            adminId,
            sessionId: id,
        });
        const refreshTokenHash = this.hash.sha256(refreshToken);

        const now = new Date();
        await this.prisma.sessionAdmin.create({
            data: {
                adminId,
                id,
                expiresAt: new Date(Date.now() + this.REFRESH_TOKEN_EXPIRES * 1000),
                refreshTokenHash,
                ip: this.requestContext.ip,
                userAgent: this.requestContext.userAgent,
                lastUsedAt: now,
            },
        });
        await this.prisma.admin.update({
            where: { id: adminId },
            data: { lastLoginAt: now, lastSeenAt: now },
        });

        const accessToken = this.generateAccessToken({
            adminId,
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
        await this.prisma.sessionAdmin.delete({ where: { id: sessionId } });
    }
}
