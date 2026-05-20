import { buildFileUrl } from "@/infrastructure/file/file.utils";
import { mapImage } from "@/infrastructure/file/img/image.mapper";
import { VideoWithImage } from "@/infrastructure/file/video/video.types";
import { VideoDto } from "@myorg/shared/dto";

export const mapVideo = (video: VideoWithImage): VideoDto => {
    return {
        id: video.id,
        url: buildFileUrl(video.entityType, video.filename),
        mimeType: video.mimeType,
        width: video.width,
        height: video.height,
        duration: video.duration,
        size: video.size,
        image: video.image ? mapImage(video.image) : null,
        createdAt: video.createdAt.toISOString(),
    };
};
