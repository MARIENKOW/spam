import { Admin, Broadcast, Image, Invite, TgAccount } from "@/generated/prisma";

export type TgAccountRecord = TgAccount & {
    admin: Pick<Admin, "email" | "role">;
    photo: Pick<Image, "filename"> | null;
    broadcast: (Pick<Broadcast, "id" | "status" | "startedAt"> & {
        _count: { runs: number };
    }) | null;
    invite: (Pick<Invite, "id" | "status"> & {
        _count: { runs: number };
    }) | null;
    _count: { ownedChannels: number };
};
