import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import * as path from "path";
import { env } from "@/config";

import { FileController } from "@/infrastructure/file/file.controller";
import { FILE_PUBLIC, UPLOADS_ROOT } from "@/infrastructure/file/file.config";
import { ImageModule } from "@/infrastructure/file/img/image.module";
import { VideoModule } from "@/infrastructure/file/video/video.module";
import { FileSignService } from "@/infrastructure/file/file-sign.service";

// Генерируем ServeStaticModule.forRoot() для каждой публичной папки
const publicStaticModules = FILE_PUBLIC.map((entityConfig) =>
    ServeStaticModule.forRoot({
        rootPath: path.resolve(
            process.cwd(),
            UPLOADS_ROOT,
            entityConfig.folder,
        ),
        serveRoot: `/${env.NEXT_PUBLIC_API_GLOBAL_PREFIX}/${UPLOADS_ROOT}/${entityConfig.folder}`,
        serveStaticOptions: {
            index: false,
            fallthrough: false,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            immutable: true, //проверять ли после времени кеша
        },
    }),
);

@Module({
    imports: [...publicStaticModules, ImageModule, VideoModule],
    providers: [FileSignService],
    controllers: [FileController],
})
export class FileModule {}
