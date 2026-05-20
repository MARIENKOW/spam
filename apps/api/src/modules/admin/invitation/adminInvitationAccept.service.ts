import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";
import { HashService } from "@/infrastructure/hash/hash.service";
import { I18nService } from "nestjs-i18n";
import { MessageStructure } from "@myorg/shared/i18n";
import { ValidationException } from "@/common/exception/validation.exception";
import { AdminInvitationAcceptDto } from "@myorg/shared/dto";
import { RegisterByInvitationAdminDtoOutput } from "@myorg/shared/form";

const TTL = 60 * 60 * 1000;

@Injectable()
export class AdminInvitationAcceptService {
    constructor(
        private prisma: PrismaService,
        private hash: HashService,
        private i18n: I18nService<MessageStructure>,
    ) {}

    async check(token: string): Promise<AdminInvitationAcceptDto> {
        const invitation = await this.prisma.adminInvitation.findUnique({
            where: { token },
        });

        if (!invitation) throw new NotFoundException();

        if (invitation.revokedAt) {
            throw new ValidationException({
                root: [
                    {
                        message: this.i18n.t(
                            "pages.admin.invitation.register.feedback.revoked",
                        ),
                        type: "error",
                    },
                ],
            });
        }

        const isExpired =
            Date.now() > invitation.createdAt.getTime() + TTL;
        if (isExpired) {
            throw new ValidationException({
                root: [
                    {
                        message: this.i18n.t(
                            "pages.admin.invitation.register.feedback.expired",
                        ),
                        type: "error",
                    },
                ],
            });
        }

        return { email: invitation.email };
    }

    async register(
        token: string,
        { password }: RegisterByInvitationAdminDtoOutput,
    ): Promise<void> {
        const invitation = await this.prisma.adminInvitation.findUnique({
            where: { token },
        });

        if (!invitation) throw new NotFoundException();

        if (invitation.revokedAt) {
            throw new ValidationException({
                root: [
                    {
                        message: this.i18n.t(
                            "pages.admin.invitation.register.feedback.revoked",
                        ),
                        type: "error",
                    },
                ],
            });
        }

        const isExpired =
            Date.now() > invitation.createdAt.getTime() + TTL;
        if (isExpired) {
            throw new ValidationException({
                root: [
                    {
                        message: this.i18n.t(
                            "pages.admin.invitation.register.feedback.expired",
                        ),
                        type: "error",
                    },
                ],
            });
        }

        const existingAdmin = await this.prisma.admin.findUnique({
            where: { email: invitation.email },
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

        const passwordHash = await this.hash.hash(password);

        await this.prisma.$transaction([
            this.prisma.admin.create({
                data: {
                    email: invitation.email,
                    passwordHash,
                    note: invitation.note,
                },
            }),
            this.prisma.adminInvitation.delete({
                where: { id: invitation.id },
            }),
        ]);
    }
}
