import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";
import { UserManagementDto, PagedResult, SessionUserViewDto } from "@myorg/shared/dto";
import { mapImage } from "@/infrastructure/file/img/image.mapper";
import { mapSessionUserView } from "@/modules/auth/user/session/session.user.mapper";
import { Prisma } from "@/generated/prisma";
import { UpdateNoteUserManagementDtoOutput } from "@myorg/shared/form";
import { UserService } from "@/modules/user/user.service";

const include = {
    avatar: true,
    _count: { select: { sessions: true } },
} satisfies Prisma.UserInclude;

type UserWithData = Prisma.UserGetPayload<{ include: typeof include }>;

@Injectable()
export class UserManagementService {
    constructor(
        private prisma: PrismaService,
        private userService: UserService,
    ) {}

    private map(user: UserWithData): UserManagementDto {
        return {
            id: user.id,
            email: user.email,
            status: user.status,
            note: user.note ?? null,
            createdAt: user.createdAt.toISOString(),
            lastSeenAt: user.lastSeenAt?.toISOString() ?? null,
            lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
            activeSessions: user._count.sessions,
            avatar: user.avatar ? mapImage(user.avatar) : null,
        };
    }

    private async findUser(id: string): Promise<UserWithData> {
        const user = await this.prisma.user.findUnique({ where: { id }, include });
        if (!user) throw new NotFoundException();
        return user;
    }

    async getAll(
        page: number,
        limit: number,
        order: string = "desc",
        sortBy: string = "createdAt",
        status: string = "all",
        query: string = "",
    ): Promise<PagedResult<UserManagementDto>> {
        const q = query.trim();
        const validSortBy = (["createdAt", "lastLoginAt", "lastSeenAt"] as const).includes(
            sortBy as "createdAt" | "lastLoginAt" | "lastSeenAt",
        )
            ? (sortBy as "createdAt" | "lastLoginAt" | "lastSeenAt")
            : "createdAt";

        const where: Prisma.UserWhereInput = {
            ...(status === "active" && { status: "ACTIVE" }),
            ...(status === "noactive" && { status: "NOACTIVE" }),
            ...(status === "blocked" && { status: "BLOCKED" }),
            ...(q && {
                OR: [
                    { email: { contains: q, mode: "insensitive" } },
                    { note: { contains: q, mode: "insensitive" } },
                ],
            }),
        };

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                include,
                orderBy: { [validSortBy]: order === "asc" ? "asc" : "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.user.count({ where }),
        ]);

        return {
            data: users.map((u) => this.map(u)),
            meta: { page, limit, total, pageCount: Math.ceil(total / limit) },
        };
    }

    async block(id: string): Promise<UserManagementDto> {
        await this.findUser(id);
        const updated = await this.prisma.user.update({ where: { id }, data: { status: "BLOCKED" }, include });
        return this.map(updated);
    }

    async activate(id: string): Promise<UserManagementDto> {
        await this.findUser(id);
        const updated = await this.prisma.user.update({ where: { id }, data: { status: "ACTIVE" }, include });
        return this.map(updated);
    }

    async delete(id: string): Promise<void> {
        await this.userService.deleteAccount(id);
    }

    async getSessions(id: string): Promise<SessionUserViewDto[]> {
        await this.findUser(id);
        const sessions = await this.prisma.sessionUser.findMany({
            where: { userId: id },
            orderBy: { lastUsedAt: "desc" },
        });
        return sessions.map((s) => mapSessionUserView(s, ""));
    }

    async deleteSession(sessionId: string): Promise<void> {
        const session = await this.prisma.sessionUser.findUnique({ where: { id: sessionId } });
        if (!session) throw new NotFoundException();
        await this.prisma.sessionUser.delete({ where: { id: sessionId } });
    }

    async deleteAllSessions(userId: string): Promise<void> {
        await this.findUser(userId);
        await this.prisma.sessionUser.deleteMany({ where: { userId } });
    }

    async updateNote(id: string, { note }: UpdateNoteUserManagementDtoOutput): Promise<UserManagementDto> {
        await this.findUser(id);
        const updated = await this.prisma.user.update({ where: { id }, data: { note: note ?? null }, include });
        return this.map(updated);
    }
}
