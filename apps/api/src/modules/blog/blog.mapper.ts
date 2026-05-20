import { mapImage } from "@/infrastructure/file/img/image.mapper";
import { BlogWithImage } from "@/modules/blog/blog.types";
import { BlogDto } from "@myorg/shared/dto";

export const mapBlog = (blog: BlogWithImage): BlogDto => ({
    id: blog.id,
    title: blog.title,
    subtitle: blog.subtitle,
    body: blog.body,
    publishedAt: blog.publishedAt.toISOString(),
    isMain: blog.isMain,
    isImportant: blog.isImportant,
    isShort: blog.isShort,
    image: mapImage(blog.image),
    bodyImagesId: blog.bodyImages.map((i) => i.id),
    bodyVideosId: blog.bodyVideos.map((v) => v.id),
    createdAt: blog.createdAt.toISOString(),
    updatedAt: blog.updatedAt.toISOString(),
});


