import { FileEntityType, Prisma, User } from "@/generated/prisma";
import { SessionUserService } from "@/modules/auth/user/session/session.user.service";
import { HashService } from "@/infrastructure/hash/hash.service";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";
import {
    Injectable,
    Logger,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common";
import { ImageDto, UserDto } from "@myorg/shared/dto";
import { mapUser } from "@/modules/user/user.mapper";
import { ImageService } from "@/infrastructure/file/img/image.service";
import { Multer } from "multer";

@Injectable()
export class UserService {
    constructor(
        private prisma: PrismaService,
        private sessionUser: SessionUserService,
        private image: ImageService,
        private hash: HashService,
    ) {}
    private readonly logger = new Logger(UserService.name);

    findById(id: string): Promise<User | null> {
        return this.find({ where: { id } });
    }
    async me(user: User): Promise<UserDto> {
        const userData = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: { avatar: true },
        });
        if (!userData) throw new NotFoundException();
        return mapUser(userData);
    }
    async changeAvatar({
        user,
        file,
    }: {
        user: User;
        file: Express.Multer.File;
    }): Promise<ImageDto> {
        // Stage 1: загружаем новый файл
        const newImage = await this.image.upload(file, FileEntityType.AVATAR, {
            mode: "original",
        });

        // Stage 2: привязываем к юзеру — если упало, откатываем новый файл
        try {
            await this.prisma.user.update({
                where: { id: user.id },
                data: { avatarId: newImage.id },
            });
        } catch (error) {
            await this.image.delete(newImage.id);
            throw error;
        }

        // Stage 3: удаляем старый — если упало, не страшно
        // юзер уже привязан к новому, старый станет сиротой
        if (user.avatarId) {
            await this.image
                .delete(user.avatarId)
                .catch((e) =>
                    this.logger.warn(
                        `Failed to delete old avatar: ${user.avatarId}`,
                        e,
                    ),
                );
        }

        return newImage;
    }
    async deleteAvatar(user: User): Promise<void> {
        if (!user.avatarId) throw new NotFoundException();
        const image = await this.image.findById(user.avatarId);
        if (!image) throw new NotFoundException();
        await this.image.delete(image.id);
    }
    async changeTheme({
        id,
        theme,
    }: {
        theme: string;
        id: string;
    }): Promise<true> {
        await this.prisma.user.update({ where: { id }, data: { theme } });
        return true;
    }
    async changeLocale({
        id,
        locale,
    }: {
        locale: string;
        id: string;
    }): Promise<true> {
        await this.prisma.user.update({ where: { id }, data: { locale } });
        return true;
    }
    async saveOauthImage({ url, userId }: { url: string; userId: string }) {
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
                return this.prisma.user.update({
                    where: { id: userId },
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
    async changePassword({
        password,
        id,
    }: {
        password: string;
        id: string;
    }): Promise<User | null> {
        const hashed = await this.hash.hash(password);
        return this.prisma.user.update({
            where: { id },
            data: { passwordHash: hashed },
        });
    }
    async activate(id: string): Promise<User | null> {
        return this.prisma.user.update({
            where: { id },
            data: { status: "ACTIVE" },
        });
    }
    findByEmail(email: string): Promise<User | null> {
        return this.find({ where: { email } });
    }

    async find(params: Prisma.UserFindUniqueArgs): Promise<User | null> {
        return this.prisma.user.findUnique(params);
    }

    async findByEmailWithResetToken(
        email: string,
    ): Promise<Prisma.UserGetPayload<{
        include: {
            resetPasswordToken: true;
        };
    }> | null> {
        return await this.prisma.user.findUnique({
            where: { email },
            include: {
                resetPasswordToken: true,
            },
        });
    }
    async findByEmailWithActivateToken(
        email: string,
    ): Promise<Prisma.UserGetPayload<{
        include: {
            activateToken: true;
        };
    }> | null> {
        return await this.prisma.user.findUnique({
            where: { email },
            include: {
                activateToken: true,
            },
        });
    }
    async findBySessionId(sessionId: string): Promise<User | null> {
        const SessionUserData = await this.sessionUser.findById(sessionId);
        if (!SessionUserData) throw new UnauthorizedException();

        const UserData = this.findById(SessionUserData.userId);

        if (!UserData) throw new UnauthorizedException();
        return UserData;
    }

    create(data: Prisma.UserCreateInput): Promise<User> {
        return this.prisma.user.create({ data });
    }

    async deleteAccount(id: string): Promise<void> {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new NotFoundException();
        if (user.avatarId) {
            await this.image
                .delete(user.avatarId)
                .catch((e) =>
                    this.logger.warn(`Failed to delete avatar on account deletion: ${user.avatarId}`, e),
                );
        }
        await this.prisma.user.delete({ where: { id } });
    }
}
