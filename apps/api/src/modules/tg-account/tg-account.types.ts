import { Admin, Image, TgAccount } from "@/generated/prisma";

export type TgAccountRecord = TgAccount & {
    admin: Pick<Admin, "email" | "role">;
    photo: Pick<Image, "filename"> | null;
};
