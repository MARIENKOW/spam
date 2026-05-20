import { Module } from "@nestjs/common";
import { VideoService } from "./video.service";
import { ImageModule } from "@/infrastructure/file/img/image.module";

@Module({
    imports: [
        ImageModule, // предоставляет ImageService для генерации превью
    ],
    providers: [VideoService],
    exports: [VideoService],
})
export class VideoModule {}
