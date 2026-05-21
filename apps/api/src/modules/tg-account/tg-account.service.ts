import {
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
    OnModuleDestroy,
    UnauthorizedException,
} from "@nestjs/common";
import { ValidationException } from "@/common/exception/validation.exception";
import { TgAccountStartOutput, TgAccountVerifyOutput } from "@myorg/shared/form";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { Api } from "telegram/tl";
import { computeCheck } from "telegram/Password";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";
import { env } from "@/config";
import {
    ImageDto,
    TgAccountDto,
    TgAccountStartResponseDto,
    TgAccountVerifyResponseDto,
    PagedResult,
} from "@myorg/shared/dto";
import { mapTgAccount } from "@/modules/tg-account/tg-account.mapper";
import { I18nService } from "nestjs-i18n";
import { MessageStructure } from "@myorg/shared/i18n";
import { FileEntityType, RoleAdmin } from "@/generated/prisma";
import { ImageService } from "@/infrastructure/file/img/image.service";

type PendingAuth = {
    client: TelegramClient;
    phoneCodeHash: string;
    expiresAt: number;
};

const PENDING_AUTH_TTL_MS = 10 * 60 * 1000;
const ADMIN_INCLUDE = {
    admin: { select: { email: true, role: true } },
    photo: { select: { filename: true } },
    broadcast: {
        select: {
            id: true,
            status: true,
            startedAt: true,
            _count: { select: { runs: true } },
        },
    },
} as const;

@Injectable()
export class TgAccountService implements OnModuleDestroy {
    private readonly logger = new Logger(TgAccountService.name);
    private readonly pendingAuths = new Map<string, PendingAuth>();
    private readonly cleanupInterval: ReturnType<typeof setInterval>;

    constructor(
        private readonly prisma: PrismaService,
        private readonly image: ImageService,
        private readonly i18n: I18nService<MessageStructure>,
    ) {
        this.cleanupInterval = setInterval(() => this.cleanupExpiredSessions(), 60_000);
    }

    onModuleDestroy(): void {
        clearInterval(this.cleanupInterval);
    }

    async authStart(phone: string, adminId: string): Promise<TgAccountStartResponseDto> {
        const existing = await this.prisma.tgAccount.findUnique({
            where: { phone },
            select: { adminId: true, admin: { select: { email: true } } },
        });

        if (existing) {
            if (existing.adminId === adminId) {
                throw new ValidationException<TgAccountStartOutput>({
                    fields: { phone: ["form.tgAccount.phone.uniqueOwn"] },
                });
            }
            throw new ValidationException<TgAccountStartOutput>({
                root: [{
                    message: this.i18n.t("pages.admin.tgAccounts.errors.attachedToOther", {
                        args: { email: existing.admin.email },
                    }),
                    type: "error",
                }],
            });
        }

        const client = new TelegramClient(
            new StringSession(""),
            env.TELEGRAM_API_ID,
            env.TELEGRAM_API_HASH,
            { connectionRetries: 3 },
        );

        await client.connect();

        const result = await client.sendCode(
            { apiId: env.TELEGRAM_API_ID, apiHash: env.TELEGRAM_API_HASH },
            phone,
        );

        this.pendingAuths.set(phone, {
            client,
            phoneCodeHash: result.phoneCodeHash,
            expiresAt: Date.now() + PENDING_AUTH_TTL_MS,
        });

        return { phoneCodeHash: result.phoneCodeHash };
    }

    async authVerify(
        phone: string,
        phoneCodeHash: string,
        code: string,
        adminId: string,
        password?: string,
    ): Promise<TgAccountVerifyResponseDto> {
        const pending = this.pendingAuths.get(phone);
        if (!pending || pending.expiresAt < Date.now()) {
            this.pendingAuths.delete(phone);
            throw new UnauthorizedException("tgAccount.authSessionExpired");
        }

        const { client } = pending;

        try {
            try {
                await client.invoke(
                    new Api.auth.SignIn({
                        phoneNumber: phone,
                        phoneCodeHash,
                        phoneCode: code,
                    }),
                );
            } catch (err: any) {
                if (err.errorMessage === "SESSION_PASSWORD_NEEDED") {
                    if (!password) {
                        return { requires2FA: true, account: null };
                    }
                    const srpInfo = await client.invoke(new Api.account.GetPassword());
                    const srpCheck = await computeCheck(srpInfo, password);
                    await client.invoke(new Api.auth.CheckPassword({ password: srpCheck }));
                } else {
                    throw err;
                }
            }

            const sessionString = (client.session.save() as unknown as string);
            const me = await client.getMe() as Api.User;

            const photo = await this.savePhoto(client, me);

            try {
                const account = await this.prisma.tgAccount.create({
                    data: {
                        phone,
                        sessionString,
                        telegramId: me.id.toString(),
                        firstName: me.firstName ?? "",
                        lastName: me.lastName ?? null,
                        username: me.username ?? null,
                        photoId: photo?.id ?? null,
                        isPremium: me.premium ?? false,
                        adminId,
                    },
                    include: ADMIN_INCLUDE,
                });

                this.pendingAuths.delete(phone);
                await client.disconnect();

                return { requires2FA: false, account: mapTgAccount(account) };
            } catch (err) {
                if (photo) {
                    await this.image
                        .delete(photo.id)
                        .catch((e) => this.logger.warn("Failed to rollback TG photo", e));
                }
                throw err;
            }
        } catch (err: any) {
            if (err.errorMessage === "PHONE_CODE_INVALID") {
                throw new ValidationException<TgAccountVerifyOutput>({
                    fields: { code: ["form.tgAccount.code.invalid"] },
                });
            }
            if (err.errorMessage === "PASSWORD_HASH_INVALID") {
                throw new ValidationException<TgAccountVerifyOutput>({
                    fields: { password: ["form.tgAccount.password.invalid"] },
                });
            }
            throw err;
        }
    }

    async getAll(
        page: number,
        limit: number,
        order: "asc" | "desc",
        status: string,
        query: string,
        adminId: string,
        role: RoleAdmin,
    ): Promise<PagedResult<TgAccountDto>> {
        const where = {
            ...(role === "ADMIN" && { adminId }),
            ...(status !== "all" && { status: status.toUpperCase() as any }),
            ...(query && {
                OR: [
                    { phone: { contains: query, mode: "insensitive" as const } },
                    { firstName: { contains: query, mode: "insensitive" as const } },
                    { lastName: { contains: query, mode: "insensitive" as const } },
                    { username: { contains: query, mode: "insensitive" as const } },
                ],
            }),
        };

        const [data, total] = await this.prisma.$transaction([
            this.prisma.tgAccount.findMany({
                where,
                include: ADMIN_INCLUDE,
                orderBy: { createdAt: order },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.tgAccount.count({ where }),
        ]);

        // Batch fetch progress for RUNNING broadcasts
        const runningBroadcastIds = data
            .filter((a) => a.broadcast?.status === "RUNNING")
            .map((a) => a.broadcast!.id)
            .filter(Boolean) as string[];

        const progressMap = new Map<string, { sent: number; total: number }>();

        if (runningBroadcastIds.length > 0) {
            // Get broadcast IDs from tgAccountId mapping
            const broadcasts = await this.prisma.broadcast.findMany({
                where: { tgAccountId: { in: data.map((a) => a.id) }, status: "RUNNING" },
                select: { id: true, tgAccountId: true },
            });

            await Promise.all(
                broadcasts.map(async (b) => {
                    const [sent, total] = await Promise.all([
                        this.prisma.broadcastRecipient.count({ where: { broadcastId: b.id, status: "SENT" } }),
                        this.prisma.broadcastRecipient.count({ where: { broadcastId: b.id } }),
                    ]);
                    progressMap.set(b.tgAccountId, { sent, total });
                }),
            );
        }

        return {
            data: data.map((a) => mapTgAccount(a, progressMap.get(a.id) ?? null)),
            meta: { page, limit, total, pageCount: Math.ceil(total / limit) },
        };
    }

    async delete(id: string, adminId: string, role: RoleAdmin): Promise<void> {
        const account = await this.prisma.tgAccount.findUnique({ where: { id } });
        if (!account) throw new NotFoundException("tgAccount.notFound");
        if (role === "ADMIN" && account.adminId !== adminId) throw new ForbiddenException("tgAccount.notAllowed");

        await this.prisma.tgAccount.delete({ where: { id } });

        if (account.photoId) {
            await this.image
                .delete(account.photoId)
                .catch((e) => this.logger.warn(`Failed to delete TG photo: ${account.photoId}`, e));
        }
    }

    private async savePhoto(
        client: TelegramClient,
        user: Api.User,
    ): Promise<ImageDto | null> {
        try {
            const buffer = await client.downloadProfilePhoto(user, { isBig: false });
            if (!buffer || (buffer as Buffer).length === 0) return null;

            const file: Express.Multer.File = {
                buffer: buffer as Buffer,
                mimetype: "image/jpeg",
                originalname: "photo.jpg",
                size: (buffer as Buffer).length,
            } as Express.Multer.File;

            return await this.image.upload(file, FileEntityType.TG_ACCOUNT_PHOTO, { mode: "webp" });
        } catch (e) {
            this.logger.warn("Failed to download TG profile photo", e);
            return null;
        }
    }

    private cleanupExpiredSessions(): void {
        const now = Date.now();
        for (const [phone, pending] of this.pendingAuths) {
            if (pending.expiresAt < now) {
                pending.client.disconnect().catch(() => {});
                this.pendingAuths.delete(phone);
            }
        }
    }
}
