import { Admin, Broadcast, Image, TgAccount } from "@/generated/prisma";

export type TgAccountRecord = TgAccount & {
    admin: Pick<Admin, "email" | "role">;
    photo: Pick<Image, "filename"> | null;
    broadcast: (Pick<Broadcast, "id" | "status" | "startedAt"> & {
        _count: { runs: number };
    }) | null;
};
