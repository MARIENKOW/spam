import { TgAccountDto } from "@myorg/shared/dto";
import { TgAccountRecord } from "@/modules/tg-account/tg-account.types";
import { FileEntityType } from "@/generated/prisma";
import { buildFileUrl } from "@/infrastructure/file/file.utils";

export const mapTgAccount = (account: TgAccountRecord): TgAccountDto => ({
    id: account.id,
    phone: account.phone,
    telegramId: account.telegramId,
    firstName: account.firstName,
    lastName: account.lastName,
    username: account.username,
    photoUrl: account.photo
        ? buildFileUrl(FileEntityType.TG_ACCOUNT_PHOTO, account.photo.filename)
        : null,
    isPremium: account.isPremium,
    status: account.status,
    createdAt: account.createdAt.toISOString(),
    adminEmail: account.admin.email,
    adminRole: account.admin.role as "ADMIN" | "SUPERADMIN",
});
