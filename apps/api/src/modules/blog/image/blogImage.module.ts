import { HashService } from "@/infrastructure/hash/hash.service";
import { PrismaModule } from "@/infrastructure/prisma/prisma.module";
import { Module } from "@nestjs/common";
import { ImageModule } from "@/infrastructure/file/img/image.module";
import { BlogImageService } from "@/modules/blog/image/blogImage.service";
import { BlogImageValidationPipe } from "@/infrastructure/file/img/pipes/blogImage.pipe";
import { BlogImageController } from "@/modules/blog/image/blogImage.controller";

@Module({
    imports: [PrismaModule, ImageModule],
    providers: [BlogImageService, HashService, BlogImageValidationPipe],
    controllers: [BlogImageController],
    exports: [BlogImageService],
})
export class BlogImageModule {}
