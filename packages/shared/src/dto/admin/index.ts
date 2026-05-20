import { ImageDto } from "../ImageDto";

export type AdminDto = {
    id: string;
    email: string;
    role: "ADMIN" | "SUPERADMIN";
    locale: string | null;
    theme: string | null;
    avatar: ImageDto | null;
};
