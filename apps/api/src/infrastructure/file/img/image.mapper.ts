import { Image } from "@/generated/prisma";
import { buildFileUrl } from "@/infrastructure/file/file.utils";
import { ImageDto } from "@myorg/shared/dto";

export const mapImage = (image: Image): ImageDto => {
    return {
        id: image.id,
        url: buildFileUrl(image.entityType, image.filename),
        mimeType: image.mimeType,
        width: image.width,
        height: image.height,
        size: image.size,
        createdAt: image.createdAt.toISOString(),
    };
};
