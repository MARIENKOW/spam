import { Prisma } from "@/generated/prisma";

export type AdminWithAvatar = Prisma.AdminGetPayload<{
    include: { avatar: true };
}>;
