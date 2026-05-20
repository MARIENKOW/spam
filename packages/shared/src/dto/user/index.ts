import { ImageDto } from "../ImageDto";

export type UserDto = {
    id: string;
    email: string;
    locale: string | null;
    theme: string | null;
    avatar: ImageDto | null;
};
