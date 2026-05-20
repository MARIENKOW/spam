import { Auth, CurrentActor } from "@/modules/auth/decorators/auth.decorator";
import { PagedResult, VideoDto } from "@myorg/shared/dto";
import { ENDPOINT, FULL_PATH_ENDPOINT } from "@myorg/shared/endpoints";
import { BLOG_VIDEO_CONFIG } from "@myorg/shared/form";
import { BlogVideoValidationPipe } from "@/infrastructure/file/video/pipes/blogVideo.pipe";
import {
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Query,
    Req,
    UnauthorizedException,
    UploadedFile,
    UseInterceptors,
} from "@nestjs/common";
import { AdminActor } from "@/modules/auth/auth.type";
import { FileInterceptor } from "@nestjs/platform-express";
import multer from "multer";
import { BlogVideoService } from "@/modules/blog/video/blogVideo.service";
import { randomUUID } from "crypto";
import {
    signUploadToken,
    verifyUploadToken,
} from "@/infrastructure/file/file-sign.utils";
import { Public } from "@/modules/auth/decorators/public.decorator";
import { TMP_PATH } from "@/infrastructure/file/file.config";
import { I18nService } from "nestjs-i18n";

const { upload } = ENDPOINT.blog.video;
const { path } = FULL_PATH_ENDPOINT.blog.video;

@Controller(path)
export class BlogVideoController {
    constructor(
        private blogVideo: BlogVideoService,
        private readonly videoPipe: BlogVideoValidationPipe,
    ) {}

    @Get(upload.path)
    @Auth("ADMIN")
    authorize(@CurrentActor() actor: AdminActor): { uploadToken: string } {
        return { uploadToken: signUploadToken(actor.admin.id) };
    }

    // ── 2. Загрузка — токен проверяется в fileFilter ──────────────
    // До записи файла на диск — но после открытия соединения.
    // После проверки файл грузится сколько угодно.
    @Post(upload.path)
    @Public()
    @UseInterceptors(
        FileInterceptor("video", {
            storage: multer.diskStorage({
                destination: TMP_PATH,
                filename: (_req, _file, cb) => cb(null, randomUUID()),
            }),
            limits: { fileSize: BLOG_VIDEO_CONFIG.maxFileSizeBytes },
            fileFilter: (req: any, _file, cb) => {
                try {
                    const actorId = verifyUploadToken(req.query.uploadToken);
                    req.actorId = actorId;
                    cb(null, true);
                } catch {
                    cb(new UnauthorizedException("upload.tokenInvalid"), false);
                }
            },
        }),
    )
    async upload(
        @Req() req: Request & { actorId: string },
        @UploadedFile()
        file: Express.Multer.File,
    ): Promise<VideoDto> {
        const validated = await this.videoPipe.transform(file);
        return this.blogVideo.upload(validated);
    }
    @Get()
    @Auth("ADMIN")
    async getAll(
        @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query("limit", new DefaultValuePipe(6), ParseIntPipe) limit: number,
    ): Promise<PagedResult<VideoDto>> {
        return this.blogVideo.getAll(page, limit);
    }
    @Delete()
    @Auth("ADMIN")
    async deleteAll(): Promise<{ skipped: number }> {
        return this.blogVideo.deleteAll();
    }
    @Delete(":id")
    @Auth("ADMIN")
    async delete(@Param("id") id: string): Promise<void> {
        return this.blogVideo.delete(id);
    }
}
