import {
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
    OnModuleDestroy,
    UnauthorizedException,
} from "@nestjs/common";
import { ValidationException } from "@/common/exception/validation.exception";
import {
    TgAccountStartOutput,
    TgAccountVerifyOutput,
} from "@myorg/shared/form";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { Api } from "telegram/tl";
import { computeCheck } from "telegram/Password";
import { signInUserWithQrCode } from "telegram/client/auth";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";
import { TgClientManagerService } from "@/modules/tg-client-manager/tg-client-manager.service";
import { env } from "@/config";
import {
    ImageDto,
    TgAccountDto,
    TgAccountStartResponseDto,
    TgAccountVerifyResponseDto,
    TgAccountQrStartResponseDto,
    TgAccountQrPollResponseDto,
    TgAccountQrVerify2faResponseDto,
    PagedResult,
} from "@myorg/shared/dto";
import { mapTgAccount } from "@/modules/tg-account/tg-account.mapper";
import { I18nService } from "nestjs-i18n";
import { MessageStructure } from "@myorg/shared/i18n";
import { FileEntityType, RoleAdmin } from "@/generated/prisma";
import { ImageService } from "@/infrastructure/file/img/image.service";
import { randomUUID } from "crypto";
import * as QRCode from "qrcode";

type PendingAuth = {
    client: TelegramClient;
    phoneCodeHash: string;
    expiresAt: number;
};

type QRAuthStatus = "pending" | "needs2fa" | "success" | "expired";

// Per-attempt 2FA result: resolves with account on correct password, rejects on wrong
type VerifyAttempt = {
    promise: Promise<TgAccountDto>;
    resolve: (account: TgAccountDto) => void;
    reject: (err: any) => void;
};

type PendingQRAuth = {
    client: TelegramClient;
    adminId: string;
    status: QRAuthStatus;
    cachedQrDataUrl: string;
    cachedTokenExpiresAt: number;
    expiresAt: number;
    passwordResolver: ((password: string) => void) | null;
    verifyAttempt: VerifyAttempt | null;
};

const PENDING_AUTH_TTL_MS = 10 * 60 * 1000;
const QR_SESSION_TTL_MS = 10 * 60 * 1000;

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
    invite: {
        select: {
            id: true,
            status: true,
            _count: { select: { runs: true } },
        },
    },
    _count: { select: { ownedChannels: true } },
} as const;

@Injectable()
export class TgAccountService implements OnModuleDestroy {
    private readonly logger = new Logger(TgAccountService.name);
    private readonly pendingAuths = new Map<string, PendingAuth>();
    private readonly pendingQRAuths = new Map<string, PendingQRAuth>();
    private readonly cleanupInterval: ReturnType<typeof setInterval>;

    constructor(
        private readonly prisma: PrismaService,
        private readonly image: ImageService,
        private readonly i18n: I18nService<MessageStructure>,
        private readonly clientManager: TgClientManagerService,
    ) {
        this.cleanupInterval = setInterval(
            () => this.cleanupExpiredSessions(),
            60_000,
        );
    }

    onModuleDestroy(): void {
        clearInterval(this.cleanupInterval);
        for (const [, pending] of this.pendingQRAuths) {
            pending.client.disconnect().catch(() => {});
        }
        this.pendingQRAuths.clear();
    }

    async authStart(
        phone: string,
        adminId: string,
    ): Promise<TgAccountStartResponseDto> {
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
                root: [
                    {
                        message: this.i18n.t(
                            "pages.admin.tgAccounts.errors.attachedToOther",
                            {
                                args: { email: existing.admin.email },
                            },
                        ),
                        type: "error",
                    },
                ],
            });
        }

        const client = new TelegramClient(
            new StringSession(""),
            env.TELEGRAM_API_ID,
            env.TELEGRAM_API_HASH,
            { connectionRetries: 3 },
        );

        await client.connect();

        const rawResult = await client.invoke(new Api.auth.SendCode({
            phoneNumber: phone,
            apiId: env.TELEGRAM_API_ID,
            apiHash: env.TELEGRAM_API_HASH,
            settings: new Api.CodeSettings({}),
        })) as unknown as Api.auth.SentCode;

        this.logger.log(`sendCode raw result: ${JSON.stringify({
            className: rawResult.className,
            type: rawResult.type?.className,
            nextType: rawResult.nextType?.className ?? null,
            timeout: rawResult.timeout ?? null,
            phoneCodeHash: rawResult.phoneCodeHash,
        })}`);

        const result = {
            phoneCodeHash: rawResult.phoneCodeHash,
            isCodeViaApp: rawResult.type?.className === "auth.SentCodeTypeApp",
        };

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
                    const srpInfo = await client.invoke(
                        new Api.account.GetPassword(),
                    );
                    const srpCheck = await computeCheck(srpInfo, password);
                    await client.invoke(
                        new Api.auth.CheckPassword({ password: srpCheck }),
                    );
                } else {
                    throw err;
                }
            }

            const sessionString = client.session.save() as unknown as string;
            const me = (await client.getMe()) as Api.User;

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

                await this.clientManager.addClient(
                    account.id,
                    sessionString,
                    adminId,
                    account.firstName,
                    account.lastName,
                    account.username,
                );

                return { requires2FA: false, account: mapTgAccount(account) };
            } catch (err) {
                if (photo) {
                    await this.image
                        .delete(photo.id)
                        .catch((e) =>
                            this.logger.warn("Failed to rollback TG photo", e),
                        );
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

    // ─── QR Login ────────────────────────────────────────────────────────────────

    async qrStart(adminId: string): Promise<TgAccountQrStartResponseDto> {
        const client = new TelegramClient(
            new StringSession(""),
            env.TELEGRAM_API_ID,
            env.TELEGRAM_API_HASH,
            { connectionRetries: 5 },
        );
        await client.connect();

        const sessionId = randomUUID();

        const pending: PendingQRAuth = {
            client,
            adminId,
            status: "pending",
            cachedQrDataUrl: "",
            cachedTokenExpiresAt: 0,
            expiresAt: Date.now() + QR_SESSION_TTL_MS,
            passwordResolver: null,
            verifyAttempt: null,
        };

        this.pendingQRAuths.set(sessionId, pending);

        // Resolve once the first QR token is ready to return to the caller
        let firstQRDone = false;
        let firstQRResolve!: (data: { qrDataUrl: string; tokenExpiresAt: number }) => void;
        let firstQRReject!: (err: any) => void;
        const firstQRPromise = new Promise<{ qrDataUrl: string; tokenExpiresAt: number }>((res, rej) => {
            firstQRResolve = res;
            firstQRReject = rej;
        });

        // signInUserWithQrCode handles: token loop, UpdateLoginToken detection,
        // DC migration (_switchDC), SESSION_PASSWORD_NEEDED → signInWithPassword, retry on wrong password
        signInUserWithQrCode(
            client,
            { apiId: env.TELEGRAM_API_ID, apiHash: env.TELEGRAM_API_HASH },
            {
                qrCode: async ({ token, expires }) => {
                    const qrDataUrl = await this.buildQRDataUrl(token);
                    const tokenExpiresAt = expires * 1000;
                    pending.cachedQrDataUrl = qrDataUrl;
                    pending.cachedTokenExpiresAt = tokenExpiresAt;
                    if (!firstQRDone) {
                        firstQRDone = true;
                        firstQRResolve({ qrDataUrl, tokenExpiresAt });
                    }
                },

                password: async (hint) => {
                    this.logger.log(`QR session ${sessionId} requires 2FA (hint: ${hint ?? "none"})`);

                    // Create a per-attempt promise that resolves with the account or rejects on wrong password
                    let attemptResolve!: (account: TgAccountDto) => void;
                    let attemptReject!: (err: any) => void;
                    pending.verifyAttempt = {
                        promise: new Promise<TgAccountDto>((res, rej) => {
                            attemptResolve = res;
                            attemptReject = rej;
                        }),
                        resolve: attemptResolve,
                        reject: attemptReject,
                    };
                    pending.status = "needs2fa";

                    // Block until the user provides the password via qrVerify2fa
                    const pw = await new Promise<string>((resolve) => {
                        pending.passwordResolver = resolve;
                    });
                    pending.passwordResolver = null;
                    return pw;
                },

                onError: async (err: Error) => {
                    const e = err as any;
                    this.logger.warn(`QR session ${sessionId} error: ${err.message}`);

                    // Wrong 2FA password — reject this attempt so qrVerify2fa throws a ValidationException,
                    // return false so GramJS retries the password callback for the next attempt
                    if (e.errorMessage === "PASSWORD_HASH_INVALID" || e.errorMessage === "SRP_PASSWORD_CHANGED") {
                        if (pending.verifyAttempt) {
                            pending.verifyAttempt.reject(e);
                            pending.verifyAttempt = null;
                        }
                        return false; // retry
                    }

                    // Fatal error: abort everything
                    if (!firstQRDone) {
                        firstQRDone = true;
                        firstQRReject(err);
                    }
                    if (pending.verifyAttempt) {
                        pending.verifyAttempt.reject(err);
                        pending.verifyAttempt = null;
                    }
                    pending.status = "expired";
                    return true; // stop
                },
            },
        )
        .then(async (user: Api.TypeUser) => {
            this.logger.log(`QR session ${sessionId} authenticated`);
            try {
                const account = await this.finalizeQRAccount(sessionId, pending, user as Api.User, adminId);
                pending.status = "success";
                // Resolve the waiting qrVerify2fa (2FA case) or leave for poll (no-2FA case)
                if (pending.verifyAttempt) {
                    pending.verifyAttempt.resolve(account);
                    pending.verifyAttempt = null;
                }
            } catch (err) {
                pending.status = "expired";
                if (pending.verifyAttempt) {
                    pending.verifyAttempt.reject(err);
                    pending.verifyAttempt = null;
                }
            }
        })
        .catch((err: any) => {
            if (!firstQRDone) {
                firstQRDone = true;
                firstQRReject(err);
            }
            if (pending.verifyAttempt) {
                pending.verifyAttempt.reject(err);
                pending.verifyAttempt = null;
            }
            if (pending.status !== "success") {
                pending.status = "expired";
            }
        });

        const { qrDataUrl, tokenExpiresAt } = await firstQRPromise;
        this.logger.log(`QR session started: ${sessionId}`);

        return { sessionId, qrDataUrl, tokenExpiresAt };
    }

    async qrPoll(
        sessionId: string,
        adminId: string,
    ): Promise<TgAccountQrPollResponseDto> {
        const pending = this.pendingQRAuths.get(sessionId);

        if (!pending || pending.expiresAt < Date.now()) {
            if (pending) this.pendingQRAuths.delete(sessionId);
            return { status: "expired" };
        }

        if (pending.adminId !== adminId) {
            throw new ForbiddenException("tgAccount.notAllowed");
        }

        if (pending.status === "success") {
            return { status: "success" };
        }

        if (pending.status === "expired") {
            this.pendingQRAuths.delete(sessionId);
            return { status: "expired" };
        }

        if (pending.status === "needs2fa") {
            return { status: "needs2fa" };
        }

        return {
            status: "pending",
            qrDataUrl: pending.cachedQrDataUrl,
            tokenExpiresAt: pending.cachedTokenExpiresAt,
        };
    }

    async qrVerify2fa(
        sessionId: string,
        password: string,
        adminId: string,
    ): Promise<TgAccountQrVerify2faResponseDto> {
        const pending = this.pendingQRAuths.get(sessionId);

        if (!pending || pending.expiresAt < Date.now()) {
            throw new UnauthorizedException("tgAccount.authSessionExpired");
        }
        if (pending.adminId !== adminId) {
            throw new ForbiddenException("tgAccount.notAllowed");
        }
        if (pending.status !== "needs2fa" || !pending.passwordResolver || !pending.verifyAttempt) {
            throw new UnauthorizedException("tgAccount.authSessionExpired");
        }

        // Capture current attempt before resolver clears it
        const attempt = pending.verifyAttempt;

        // Provide the password to the blocked signInUserWithQrCode password callback
        pending.passwordResolver(password);

        // Wait for this attempt to succeed or fail
        try {
            const account = await attempt.promise;
            return { account };
        } catch (err: any) {
            if (err.errorMessage === "PASSWORD_HASH_INVALID" || err.errorMessage === "SRP_PASSWORD_CHANGED") {
                throw new ValidationException<any>({
                    fields: { password: ["form.tgAccount.password.invalid"] },
                });
            }
            throw err;
        }
    }

    async qrCancel(sessionId: string, adminId: string): Promise<void> {
        const pending = this.pendingQRAuths.get(sessionId);
        if (!pending) return;
        if (pending.adminId !== adminId) return;

        this.pendingQRAuths.delete(sessionId);

        // Cancel any waiting password promise so the GramJS auth loop exits
        if (pending.passwordResolver) {
            pending.passwordResolver("AUTH_USER_CANCEL");
        }
        await pending.client.disconnect().catch(() => {});
    }

    private async finalizeQRAccount(
        sessionId: string,
        pending: PendingQRAuth,
        me: Api.User,
        adminId: string,
    ): Promise<TgAccountDto> {
        const sessionString = pending.client.session.save() as unknown as string;
        const phone = me.phone ? `+${me.phone}` : "";

        const existing = await this.prisma.tgAccount.findFirst({
            where: { telegramId: me.id.toString() },
            select: { adminId: true, admin: { select: { email: true } } },
        });

        if (existing) {
            if (existing.adminId === adminId) {
                throw new ValidationException<TgAccountStartOutput>({
                    fields: { phone: ["form.tgAccount.phone.uniqueOwn"] },
                });
            }
            throw new ValidationException<TgAccountStartOutput>({
                root: [
                    {
                        message: this.i18n.t(
                            "pages.admin.tgAccounts.errors.attachedToOther",
                            { args: { email: existing.admin.email } },
                        ),
                        type: "error",
                    },
                ],
            });
        }

        const photo = await this.savePhoto(pending.client, me);

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

            // Remove from pending and disconnect QR client before clientManager creates a fresh connection
            this.pendingQRAuths.delete(sessionId);
            await pending.client.disconnect().catch(() => {});

            await this.clientManager.addClient(
                account.id,
                sessionString,
                adminId,
                account.firstName,
                account.lastName,
                account.username,
            );

            return mapTgAccount(account);
        } catch (err) {
            if (photo) {
                await this.image
                    .delete(photo.id)
                    .catch((e) => this.logger.warn("Failed to rollback QR photo", e));
            }
            throw err;
        }
    }

    private async buildQRDataUrl(token: Buffer | Uint8Array): Promise<string> {
        const tokenBase64 = Buffer.from(token)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=/g, "");
        const url = `tg://login?token=${tokenBase64}`;
        return QRCode.toDataURL(url, { width: 256, margin: 2 });
    }

    // ─── Other methods ────────────────────────────────────────────────────────────

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
                    {
                        phone: {
                            contains: query,
                            mode: "insensitive" as const,
                        },
                    },
                    {
                        firstName: {
                            contains: query,
                            mode: "insensitive" as const,
                        },
                    },
                    {
                        lastName: {
                            contains: query,
                            mode: "insensitive" as const,
                        },
                    },
                    {
                        username: {
                            contains: query,
                            mode: "insensitive" as const,
                        },
                    },
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

        const runningBroadcastIds = data
            .filter((a) => a.broadcast?.status === "RUNNING")
            .map((a) => a.broadcast!.id)
            .filter(Boolean) as string[];

        const broadcastProgressMap = new Map<string, { sent: number; failed: number; total: number }>();

        if (runningBroadcastIds.length > 0) {
            const broadcasts = await this.prisma.broadcast.findMany({
                where: {
                    tgAccountId: { in: data.map((a) => a.id) },
                    status: "RUNNING",
                },
                select: { id: true, tgAccountId: true },
            });

            await Promise.all(
                broadcasts.map(async (b) => {
                    const [sent, pending, failed] = await Promise.all([
                        this.prisma.broadcastRecipient.count({ where: { broadcastId: b.id, status: "SENT" } }),
                        this.prisma.broadcastRecipient.count({ where: { broadcastId: b.id, status: "PENDING" } }),
                        this.prisma.broadcastRecipient.count({ where: { broadcastId: b.id, status: "FAILED" } }),
                    ]);
                    broadcastProgressMap.set(b.tgAccountId, { sent, failed, total: sent + pending + failed });
                }),
            );
        }

        const inviteProgressMap = new Map<string, { invited: number; failed: number; total: number }>();

        const runningInvites = data.filter((a) => a.invite?.status === "RUNNING");
        if (runningInvites.length > 0) {
            await Promise.all(
                runningInvites.map(async (a) => {
                    const [sent, pending, failed] = await Promise.all([
                        this.prisma.inviteRecipient.count({ where: { inviteId: a.invite!.id, status: "SENT" } }),
                        this.prisma.inviteRecipient.count({ where: { inviteId: a.invite!.id, status: "PENDING" } }),
                        this.prisma.inviteRecipient.count({ where: { inviteId: a.invite!.id, status: "FAILED" } }),
                    ]);
                    inviteProgressMap.set(a.id, { invited: sent, failed, total: sent + pending + failed });
                }),
            );
        }

        return {
            data: data.map((a) =>
                mapTgAccount(a, broadcastProgressMap.get(a.id) ?? null, inviteProgressMap.get(a.id) ?? null),
            ),
            meta: { page, limit, total, pageCount: Math.ceil(total / limit) },
        };
    }

    async getOne(id: string, adminId: string, role: RoleAdmin): Promise<TgAccountDto> {
        const account = await this.prisma.tgAccount.findUnique({
            where: { id },
            include: ADMIN_INCLUDE,
        });
        if (!account) throw new NotFoundException("tgAccount.notFound");
        if (role === "ADMIN" && account.adminId !== adminId)
            throw new ForbiddenException("tgAccount.notAllowed");

        let inviteProgress: { invited: number; failed: number; total: number } | null = null;
        if (account.invite?.status === "RUNNING") {
            const [sent, pending, failed] = await Promise.all([
                this.prisma.inviteRecipient.count({ where: { inviteId: account.invite.id, status: "SENT" } }),
                this.prisma.inviteRecipient.count({ where: { inviteId: account.invite.id, status: "PENDING" } }),
                this.prisma.inviteRecipient.count({ where: { inviteId: account.invite.id, status: "FAILED" } }),
            ]);
            inviteProgress = { invited: sent, failed, total: sent + pending + failed };
        }

        let broadcastProgress: { sent: number; failed: number; total: number } | null = null;
        if (account.broadcast?.status === "RUNNING") {
            const [sent, pending, failed] = await Promise.all([
                this.prisma.broadcastRecipient.count({ where: { broadcastId: account.broadcast.id, status: "SENT" } }),
                this.prisma.broadcastRecipient.count({ where: { broadcastId: account.broadcast.id, status: "PENDING" } }),
                this.prisma.broadcastRecipient.count({ where: { broadcastId: account.broadcast.id, status: "FAILED" } }),
            ]);
            broadcastProgress = { sent, failed, total: sent + pending + failed };
        }

        return mapTgAccount(account, broadcastProgress, inviteProgress);
    }

    async delete(id: string, adminId: string, role: RoleAdmin): Promise<void> {
        const account = await this.prisma.tgAccount.findUnique({
            where: { id },
        });
        if (!account) throw new NotFoundException("tgAccount.notFound");
        if (role === "ADMIN" && account.adminId !== adminId)
            throw new ForbiddenException("tgAccount.notAllowed");

        await this.prisma.tgAccount.delete({ where: { id } });
        await this.clientManager.removeClient(id);

        if (account.photoId) {
            await this.image
                .delete(account.photoId)
                .catch((e) =>
                    this.logger.warn(
                        `Failed to delete TG photo: ${account.photoId}`,
                        e,
                    ),
                );
        }
    }

    private async savePhoto(
        client: TelegramClient,
        user: Api.User,
    ): Promise<ImageDto | null> {
        try {
            const buffer = await client.downloadProfilePhoto(user, {
                isBig: false,
            });
            if (!buffer || (buffer as Buffer).length === 0) return null;

            const file: Express.Multer.File = {
                buffer: buffer as Buffer,
                mimetype: "image/jpeg",
                originalname: "photo.jpg",
                size: (buffer as Buffer).length,
            } as Express.Multer.File;

            return await this.image.upload(
                file,
                FileEntityType.TG_ACCOUNT_PHOTO,
                { mode: "webp" },
            );
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
        for (const [sessionId, pending] of this.pendingQRAuths) {
            if (pending.expiresAt < now) {
                this.pendingQRAuths.delete(sessionId);
                pending.client.disconnect().catch(() => {});
            }
        }
    }
}
