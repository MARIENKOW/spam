import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";
import { AdminService } from "@/modules/admin/admin.service";
import { AdminManagementDto, PagedResult, SessionAdminViewDto } from "@myorg/shared/dto";
import { mapImage } from "@/infrastructure/file/img/image.mapper";
import { mapSessionAdminView } from "@/modules/auth/admin/session/session.admin.mapper";
import { Prisma } from "@/generated/prisma";
import { UpdateNoteAdminManagementDtoOutput } from "@myorg/shared/form";

const include = {
    avatar: true,
    _count: { select: { sessions: true } },
} satisfies Prisma.AdminInclude;

type AdminWithData = Prisma.AdminGetPayload<{ include: typeof include }>;

@Injectable()
export class AdminManagementService {
    constructor(
        private prisma: PrismaService,
        private adminService: AdminService,
    ) {}

    private map(admin: AdminWithData): AdminManagementDto {
        return {
            id: admin.id,
            email: admin.email,
            status: admin.status,
            note: admin.note ?? null,
            createdAt: admin.createdAt.toISOString(),
            lastSeenAt: admin.lastSeenAt?.toISOString() ?? null,
            lastLoginAt: admin.lastLoginAt?.toISOString() ?? null,
            activeSessions: admin._count.sessions,
            avatar: admin.avatar ? mapImage(admin.avatar) : null,
        };
    }

    private async findAdmin(id: string): Promise<AdminWithData> {
        const admin = await this.prisma.admin.findUnique({
            where: { id, role: "ADMIN" },
            include,
        });
        if (!admin) throw new NotFoundException();
        return admin;
    }

    async getAll(
        page: number,
        limit: number,
        order: string = "desc",
        sortBy: string = "createdAt",
        status: string = "all",
        query: string = "",
    ): Promise<PagedResult<AdminManagementDto>> {
        const q = query.trim();
        const validSortBy = (["createdAt", "lastLoginAt", "lastSeenAt"] as const).includes(
            sortBy as "createdAt" | "lastLoginAt" | "lastSeenAt",
        )
            ? (sortBy as "createdAt" | "lastLoginAt" | "lastSeenAt")
            : "createdAt";

        const where: Prisma.AdminWhereInput = {
            role: "ADMIN",
            ...(status === "active" && { status: "ACTIVE" }),
            ...(status === "blocked" && { status: "BLOCKED" }),
            ...(q && {
                OR: [
                    { email: { contains: q, mode: "insensitive" } },
                    { note: { contains: q, mode: "insensitive" } },
                ],
            }),
        };

        const [admins, total] = await Promise.all([
            this.prisma.admin.findMany({
                where,
                include,
                orderBy: { [validSortBy]: order === "asc" ? "asc" : "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.admin.count({ where }),
        ]);

        return {
            data: admins.map((a) => this.map(a)),
            meta: { page, limit, total, pageCount: Math.ceil(total / limit) },
        };
    }

    async block(id: string): Promise<AdminManagementDto> {
        await this.findAdmin(id);
        const updated = await this.prisma.admin.update({
            where: { id },
            data: { status: "BLOCKED" },
            include,
        });
        return this.map(updated);
    }

    async unblock(id: string): Promise<AdminManagementDto> {
        await this.findAdmin(id);
        const updated = await this.prisma.admin.update({
            where: { id },
            data: { status: "ACTIVE" },
            include,
        });
        return this.map(updated);
    }

    async delete(id: string): Promise<void> {
        await this.findAdmin(id);
        await this.adminService.deleteAccount(id);
    }

    async getSessions(id: string): Promise<SessionAdminViewDto[]> {
        await this.findAdmin(id);
        const sessions = await this.prisma.sessionAdmin.findMany({
            where: { adminId: id },
            orderBy: { lastUsedAt: "desc" },
        });
        return sessions.map((s) => mapSessionAdminView(s, ""));
    }

    async deleteSession(sessionId: string): Promise<void> {
        const session = await this.prisma.sessionAdmin.findUnique({
            where: { id: sessionId },
            include: { admin: { select: { role: true } } },
        });
        if (!session || session.admin.role !== "ADMIN") throw new NotFoundException();
        await this.prisma.sessionAdmin.delete({ where: { id: sessionId } });
    }

    async deleteAllSessions(adminId: string): Promise<void> {
        await this.findAdmin(adminId);
        await this.prisma.sessionAdmin.deleteMany({ where: { adminId } });
    }

    async updateNote(id: string, { note }: UpdateNoteAdminManagementDtoOutput): Promise<AdminManagementDto> {
        await this.findAdmin(id);
        const updated = await this.prisma.admin.update({
            where: { id },
            data: { note: note ?? null },
            include,
        });
        return this.map(updated);
    }
}
