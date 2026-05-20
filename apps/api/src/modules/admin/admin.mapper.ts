import { Admin } from "@/generated/prisma";
import { mapImage } from "@/infrastructure/file/img/image.mapper";
import { AdminWithAvatar } from "@/modules/admin/types";
import { AdminDto } from "@myorg/shared/dto";

export const mapAdmin = (admin: AdminWithAvatar): AdminDto => ({
    id: admin.id,
    email: admin.email,
    theme: admin.theme,
    role: admin.role,
    locale: admin.locale,
    avatar: admin.avatar ? mapImage(admin.avatar) : null,
});
