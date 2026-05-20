import { FileEntityType } from "@/generated/prisma";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { ImageDto, PagedResult } from "@myorg/shared/dto";
import { ImageService } from "@/infrastructure/file/img/image.service";
import { mapImage } from "@/infrastructure/file/img/image.mapper";
import { ValidationException } from "@/common/exception/validation.exception";
import { I18nService } from "nestjs-i18n";

const WHERE_FREE = {
    entityType: FileEntityType.BLOG_IMAGE,
    blogBody: { none: {} },
} as const;

@Injectable()
export class BlogImageService {
    constructor(
        private prisma: PrismaService,
        private image: ImageService,
        private i18n: I18nService,
    ) {}

    async upload(file: Express.Multer.File): Promise<ImageDto> {
        return this.image.upload(file, FileEntityType.BLOG_IMAGE, {
            mode: "original",
        });
    }

    /** Возвращает только картинки не привязанные ни к одному блогу */
    async getAll(page: number, limit: number): Promise<PagedResult<ImageDto>> {
        const [total, images] = await Promise.all([
            this.prisma.image.count({ where: WHERE_FREE }),
            this.prisma.image.findMany({
                where: WHERE_FREE,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
        ]);
        return {
            data: images.map(mapImage),
            meta: { page, limit, total, pageCount: Math.ceil(total / limit) },
        };
    }

    async delete(id: string): Promise<void> {
        const image = await this.prisma.image.findFirst({
            where: { id, entityType: FileEntityType.BLOG_IMAGE },
            include: { _count: { select: { blogBody: true } } },
        });
        if (!image) throw new NotFoundException();

        if (image._count.blogBody > 0) {
            throw new ValidationException({
                root: [
                    {
                        message: this.i18n.t(
                            "pages.admin.blog.feedback.mediaImage.linkedToBlog",
                        ),
                        type: "info",
                    },
                ],
            });
        }

        await this.image.delete(image.id);
    }

    /** Удаляет только свободные изображения. Возвращает количество пропущенных */
    async deleteAll(): Promise<{ skipped: number }> {
        const all = await this.prisma.image.findMany({
            where: { entityType: FileEntityType.BLOG_IMAGE },
            include: { _count: { select: { blogBody: true } } },
        });

        const free = all.filter((img) => img._count.blogBody === 0);
        const skipped = all.length - free.length;

        await Promise.allSettled(free.map((img) => this.image.delete(img.id)));

        return { skipped: 0 };
    }
}
