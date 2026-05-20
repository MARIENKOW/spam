import { Prisma } from "@/generated/prisma";

export type UserWithAvatar = Prisma.UserGetPayload<{
    include: { avatar: true };
}>;
