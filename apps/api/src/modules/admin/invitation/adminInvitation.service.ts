import { AdminInvitation } from "@/generated/prisma";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";
import { MailerService } from "@/infrastructure/mailer/mailer.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { MessageStructure } from "@myorg/shared/i18n";
import { ValidationException } from "@/common/exception/validation.exception";
import { AdminInvitationDto, PagedResult } from "@myorg/shared/dto";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";
import { RequestContextService } from "@/common/request-context/request-context.service";
import { randomUUID } from "crypto";
import {
    CreateAdminInvitationDtoOutput,
    UpdateNoteAdminInvitationDtoOutput,
} from "@myorg/shared/form";

const TTL = 60 * 60 * 1000; // 7 дней

@Injectable()
export class AdminInvitationService {
    readonly ttl = TTL;

    constructor(
        private prisma: PrismaService,
        private mailer: MailerService,
        private i18n: I18nService<MessageStructure>,
        private requestContext: RequestContextService,
    ) {}

    private buildUrl(token: string): string {
        return `${this.requestContext.origin}${FULL_PATH_ROUTE.admin.invitation.path}?token=${encodeURIComponent(token)}`;
    }

    private map(inv: AdminInvitation): AdminInvitationDto {
        const expiresAt = new Date(inv.createdAt.getTime() + TTL);
        const isRevoked = !!inv.revokedAt;
        const isExpired = !isRevoked && Date.now() > expiresAt.getTime();

        return {
            id: inv.id,
            email: inv.email,
            note: inv.note,
            token: inv.token,
            url: this.buildUrl(inv.token),
            isExpired,
            isRevoked,
            expiresAt: expiresAt.toISOString(),
            revokedAt: inv.revokedAt ? inv.revokedAt.toISOString() : null,
        };
    }

    async getAll(
        page: number,
        limit: number,
        status: string = "all",
        order: string = "desc",
        query: string = "",
    ): Promise<PagedResult<AdminInvitationDto>> {
        const expiryBoundary = new Date(Date.now() - this.ttl);
        const q = query.trim();

        const statusWhere =
            status === "revoked"
                ? { revokedAt: { not: null } }
                : status === "active"
                  ? { revokedAt: null, createdAt: { gt: expiryBoundary } }
                  : status === "expired"
                    ? { revokedAt: null, createdAt: { lte: expiryBoundary } }
                    : {};

        const where = {
            ...statusWhere,
            ...(q && {
                OR: [
                    { email: { contains: q, mode: "insensitive" as const } },
                    { note: { contains: q, mode: "insensitive" as const } },
                ],
            }),
        };

        const [invitations, total] = await Promise.all([
            this.prisma.adminInvitation.findMany({
                where,
                orderBy: { createdAt: order === "asc" ? "asc" : "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.adminInvitation.count({ where }),
        ]);
        return {
            data: invitations.map((inv) => this.map(inv)),
            meta: { page, limit, total, pageCount: Math.ceil(total / limit) },
        };
    }

    async create({
        email,
        note,
    }: CreateAdminInvitationDtoOutput): Promise<AdminInvitationDto> {
        const existing = await this.prisma.adminInvitation.findUnique({
            where: { email },
        });
        if (existing) {
            throw new ValidationException({
                root: [
                    {
                        message: this.i18n.t(
                            "pages.admin.invitation.feedback.alreadyExists",
                        ),
                        type: "error",
                    },
                ],
            });
        }

        const existingAdmin = await this.prisma.admin.findUnique({
            where: { email },
        });
        if (existingAdmin) {
            throw new ValidationException({
                root: [
                    {
                        message: this.i18n.t(
                            "pages.admin.invitation.feedback.adminAlreadyExists",
                        ),
                        type: "error",
                    },
                ],
            });
        }

        const token = randomUUID();
        const invitation = await this.prisma.adminInvitation.create({
            data: { email, note, token },
        });

        await this.sendInvitationEmail(invitation.email, invitation.token);

        return this.map(invitation);
    }

    async delete(id: string): Promise<void> {
        const invitation = await this.prisma.adminInvitation.findUnique({
            where: { id },
        });
        if (!invitation) throw new NotFoundException();
        await this.prisma.adminInvitation.delete({ where: { id } });
    }

    async revoke(id: string): Promise<AdminInvitationDto> {
        const invitation = await this.prisma.adminInvitation.findUnique({
            where: { id },
        });
        if (!invitation) throw new NotFoundException();
        if (invitation.revokedAt) {
            throw new ValidationException({
                root: [
                    {
                        message: this.i18n.t(
                            "pages.admin.invitation.feedback.alreadyRevoked",
                        ),
                        type: "info",
                    },
                ],
            });
        }
        const updated = await this.prisma.adminInvitation.update({
            where: { id },
            data: { revokedAt: new Date() },
        });
        return this.map(updated);
    }

    async unrevoke(id: string): Promise<AdminInvitationDto> {
        const invitation = await this.prisma.adminInvitation.findUnique({
            where: { id },
        });
        if (!invitation) throw new NotFoundException();
        if (!invitation.revokedAt) {
            throw new ValidationException({
                root: [
                    {
                        message: this.i18n.t(
                            "pages.admin.invitation.feedback.notRevoked",
                        ),
                        type: "info",
                    },
                ],
            });
        }
        const updated = await this.prisma.adminInvitation.update({
            where: { id },
            data: { revokedAt: null },
        });
        return this.map(updated);
    }

    async resend(id: string): Promise<AdminInvitationDto> {
        const invitation = await this.prisma.adminInvitation.findUnique({
            where: { id },
        });
        if (!invitation) throw new NotFoundException();
        if (invitation.revokedAt) {
            throw new ValidationException({
                root: [
                    {
                        message: this.i18n.t(
                            "pages.admin.invitation.feedback.isRevoked",
                        ),
                        type: "error",
                    },
                ],
            });
        }

        const token = randomUUID();
        const updated = await this.prisma.adminInvitation.update({
            where: { id },
            data: { token, createdAt: new Date() },
        });

        await this.sendInvitationEmail(updated.email, updated.token);

        return this.map(updated);
    }

    async updateNote(
        id: string,
        { note }: UpdateNoteAdminInvitationDtoOutput,
    ): Promise<AdminInvitationDto> {
        const invitation = await this.prisma.adminInvitation.findUnique({
            where: { id },
        });
        if (!invitation) throw new NotFoundException();
        const updated = await this.prisma.adminInvitation.update({
            where: { id },
            data: { note },
        });
        return this.map(updated);
    }

    private async sendInvitationEmail(
        email: string,
        token: string,
    ): Promise<void> {
        const url = this.buildUrl(token);
        await this.mailer.sendAdminInvitation({
            to: email,
            url,
            expires: this.ttl,
        });
    }
}
