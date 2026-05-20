import { FileEntityType } from "@/generated/prisma";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { PagedResult, VideoDto } from "@myorg/shared/dto";
import { VideoService } from "@/infrastructure/file/video/video.service";
import { mapVideo } from "@/infrastructure/file/video/video.mapper";
import { ValidationException } from "@/common/exception/validation.exception";
import { I18nService } from "nestjs-i18n";

const WHERE_FREE = {
    entityType: FileEntityType.BLOG_VIDEO,
    blogBody: { none: {} },
} as const;

@Injectable()
export class BlogVideoService {
    constructor(
        private prisma: PrismaService,
        private video: VideoService,
        private i18n: I18nService,
    ) {}

    async upload(file: Express.Multer.File): Promise<VideoDto> {
        return this.video.upload(file, FileEntityType.BLOG_VIDEO, {
            mode: "original",
        });
    }

    /** Возвращает только видео не привязанные ни к одному блогу */
    async getAll(page: number, limit: number): Promise<PagedResult<VideoDto>> {
        const [total, videos] = await Promise.all([
            this.prisma.video.count({ where: WHERE_FREE }),
            this.prisma.video.findMany({
                where: WHERE_FREE,
                include: { image: true },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
        ]);
        return {
            data: videos.map(mapVideo),
            meta: { page, limit, total, pageCount: Math.ceil(total / limit) },
        };
    }

    async delete(id: string): Promise<void> {
        const video = await this.prisma.video.findFirst({
            where: { id, entityType: FileEntityType.BLOG_VIDEO },
            include: { _count: { select: { blogBody: true } } },
        });
        if (!video) throw new NotFoundException();

        if (video._count.blogBody > 0) {
            throw new ValidationException({
                root: [
                    {
                        message: this.i18n.t(
                            "pages.admin.blog.feedback.mediaVideo.linkedToBlog",
                        ),
                        type: "info",
                    },
                ],
            });
        }

        await this.video.delete(video.id);
    }

    /** Удаляет только свободные видео. Возвращает количество пропущенных */
    async deleteAll(): Promise<{ skipped: number }> {
        const all = await this.prisma.video.findMany({
            where: { entityType: FileEntityType.BLOG_VIDEO },
            include: { _count: { select: { blogBody: true } } },
        });

        const free = all.filter((v) => v._count.blogBody === 0);
        const skipped = all.length - free.length;

        await Promise.allSettled(free.map((v) => this.video.delete(v.id)));

        return { skipped: 0 };
    }
}
