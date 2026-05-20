import { ImageDto } from "./ImageDto";

export interface VideoDto {
    id: string;
    url: string; // готовый URL — публичный или через /images/file/:id
    mimeType: string;
    width: number;
    height: number;
    size: number;
    duration: number;
    image: ImageDto | null;
    createdAt: string;
}
