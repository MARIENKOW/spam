import { HashService } from "@/infrastructure/hash/hash.service";
import { PrismaModule } from "@/infrastructure/prisma/prisma.module";
import { Module } from "@nestjs/common";
import { BlogVideoService } from "@/modules/blog/video/blogVideo.service";
import { BlogVideoController } from "@/modules/blog/video/blogVideo.controller";
import { VideoModule } from "@/infrastructure/file/video/video.module";
import { BlogVideoValidationPipe } from "@/infrastructure/file/video/pipes/blogVideo.pipe";

@Module({
    imports: [PrismaModule, VideoModule],
    providers: [BlogVideoService, HashService,BlogVideoValidationPipe],
    controllers: [BlogVideoController],
    exports: [BlogVideoService],
})
export class BlogVideoModule {}
