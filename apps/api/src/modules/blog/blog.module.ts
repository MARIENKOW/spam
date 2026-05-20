import { PrismaModule } from "@/infrastructure/prisma/prisma.module";
import { Module } from "@nestjs/common";
import { BlogService } from "@/modules/blog/blog.service";
import { BlogController } from "@/modules/blog/blog.controller";
import { ImageModule } from "@/infrastructure/file/img/image.module";

@Module({
    imports: [PrismaModule, ImageModule],
    providers: [BlogService],
    controllers: [BlogController],
    exports: [BlogService],
})
export class BlogModule {}
