import { Prisma, Admin, FileEntityType } from "@/generated/prisma";
import { SessionAdminService } from "@/modules/auth/admin/session/session.admin.service";
import { HashService } from "@/infrastructure/hash/hash.service";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";
import {
    Injectable,
    Logger,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common";
import { ImageService } from "@/infrastructure/file/img/image.service";
import { AdminDto, ImageDto } from "@myorg/shared/dto";
import { mapAdmin } from "@/modules/admin/admin.mapper";

@Injectable()
export class AdminService {
    constructor(
        private prisma: PrismaService,
        private session: SessionAdminService,
        private image: ImageService,

        private hash: HashService,
    ) {}
    private readonly logger = new Logger(AdminService.name);

    findById(id: string): Promise<Admin | null> {
        return this.find({ where: { id } });
    }
    async me(admin: Admin): Promise<AdminDto> {
        const adminData = await this.prisma.admin.findUnique({
            where: { id: admin.id },
            include: { avatar: true },
        });
        if (!adminData) throw new NotFoundException();
        return mapAdmin(adminData);
    }
    async changeAvatar({
        admin,
        file,
    }: {
        admin: Admin;
        file: Express.Multer.File;
    }): Promise<ImageDto> {
        // Stage 1: загружаем новый файл
        const newImage = await this.image.upload(file, FileEntityType.AVATAR, {
            mode: "original",
        });

        // Stage 2: привязываем к юзеру — если упало, откатываем новый файл
        try {
            await this.prisma.admin.update({
                where: { id: admin.id },
                data: { avatarId: newImage.id },
            });
        } catch (error) {
            await this.image.delete(newImage.id);
            throw error;
        }

        // Stage 3: удаляем старый — если упало, не страшно
        // юзер уже привязан к новому, старый станет сиротой
        if (admin.avatarId) {
            await this.image
                .delete(admin.avatarId)
                .catch((e) =>
                    this.logger.warn(
                        `Failed to delete old avatar: ${admin.avatarId}`,
                        e,
                    ),
                );
        }

        return newImage;
    }
    async deleteAvatar(admin: Admin): Promise<void> {
        if (!admin.avatarId) throw new NotFoundException();
        const image = await this.image.findById(admin.avatarId);
        if (!image) throw new NotFoundException();
        await this.image.delete(image.id);
    }

    async saveOauthImage({ url, adminId }: { url: string; adminId: string }) {
        try {
            const response = await fetch(url);
            const buffer = Buffer.from(await response.arrayBuffer());

            const file: Express.Multer.File = {
                buffer,
                mimetype: "image/jpeg",
                originalname: "avatar.jpg",
                size: buffer.length,
                // остальные поля multer если нужны
            } as Express.Multer.File;

            const image = await this.image.upload(file, FileEntityType.AVATAR, {
                mode: "webp",
            });

            try {
                return this.prisma.admin.update({
                    where: { id: adminId },
                    data: { avatarId: image.id },
                });
            } catch (error) {
                await this.image.delete(image.id);
                throw error;
            }
        } catch (error) {
            this.logger.warn(`Failed to save oauth image`, error);
        }
    }
    async changeTheme({
        id,
        theme,
    }: {
        theme: string;
        id: string;
    }): Promise<true> {
        await this.prisma.admin.update({ where: { id }, data: { theme } });
        return true;
    }

    async changeLocale({
        id,
        locale,
    }: {
        locale: string;
        id: string;
    }): Promise<true> {
        await this.prisma.admin.update({ where: { id }, data: { locale } });
        return true;
    }
    async changePassword({
        password,
        id,
    }: {
        password: string;
        id: string;
    }): Promise<Admin | null> {
        const hashed = await this.hash.hash(password);
        return this.prisma.admin.update({
            where: { id },
            data: { passwordHash: hashed },
        });
    }
    async activate(id: string): Promise<Admin | null> {
        return this.prisma.admin.update({
            where: { id },
            data: { status: "ACTIVE" },
        });
    }
    findByEmail(email: string): Promise<Admin | null> {
        return this.find({ where: { email } });
    }

    async find(params: Prisma.AdminFindUniqueArgs): Promise<Admin | null> {
        return this.prisma.admin.findUnique(params);
    }

    async findByEmailWithResetToken(
        email: string,
    ): Promise<Prisma.AdminGetPayload<{
        include: {
            resetPasswordToken: true;
        };
    }> | null> {
        return await this.prisma.admin.findUnique({
            where: { email },
            include: {
                resetPasswordToken: true,
            },
        });
    }
    async findBySessionId(sessionId: string): Promise<Admin | null> {
        const SessionData = await this.session.findById(sessionId);
        if (!SessionData) throw new UnauthorizedException();

        const admin = this.findById(SessionData.adminId);

        if (!admin) throw new UnauthorizedException();
        return admin;
    }

    create(data: Prisma.AdminCreateInput): Promise<Admin> {
        return this.prisma.admin.create({ data });
    }

    async deleteAccount(id: string): Promise<void> {
        const admin = await this.prisma.admin.findUnique({ where: { id } });
        if (!admin) throw new NotFoundException();
        if (admin.avatarId) {
            await this.image.delete(admin.avatarId).catch((e) =>
                this.logger.warn(`Failed to delete avatar on account deletion: ${admin.avatarId}`, e),
            );
        }
        await this.prisma.admin.delete({ where: { id } });
    }
}
