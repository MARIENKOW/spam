import { ImageDto } from "./ImageDto";

export interface BlogDto {
    id: string;
    title: string;
    subtitle: string | null;
    body: string;
    publishedAt: string;
    isMain: boolean;
    isImportant: boolean;
    isShort: boolean;
    image: ImageDto;
    bodyImagesId: string[];
    bodyVideosId: string[];
    createdAt: string;
    updatedAt: string;
}
