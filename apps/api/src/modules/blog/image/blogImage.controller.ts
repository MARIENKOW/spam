import { Auth } from "@/modules/auth/decorators/auth.decorator";
import { ImageDto, PagedResult } from "@myorg/shared/dto";
import { ENDPOINT, FULL_PATH_ENDPOINT } from "@myorg/shared/endpoints";
import {
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Query,
    UploadedFile,
    UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";

import { BlogImageService } from "@/modules/blog/image/blogImage.service";
import { BlogImageValidationPipe } from "@/infrastructure/file/img/pipes/blogImage.pipe";

const { upload } = ENDPOINT.blog.image;
const { path } = FULL_PATH_ENDPOINT.blog.image;

@Controller(path)
export class BlogImageController {
    constructor(
        private blogImage: BlogImageService,
        private blogImagePipe: BlogImageValidationPipe,
    ) {}

    @Post(upload.path)
    @UseInterceptors(FileInterceptor("image", { storage: memoryStorage() }))
    @Auth("ADMIN")
    async upload(
        @UploadedFile()
        file: Express.Multer.File,
    ): Promise<ImageDto> {
        const validation = await this.blogImagePipe.transform(file);
        return this.blogImage.upload(validation);
    }
    @Get()
    @Auth("ADMIN")
    async getAll(
        @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query("limit", new DefaultValuePipe(6), ParseIntPipe) limit: number,
    ): Promise<PagedResult<ImageDto>> {
        return this.blogImage.getAll(page, limit);
    }
    @Delete()
    @Auth("ADMIN")
    async deleteAll(): Promise<{ skipped: number }> {
        return this.blogImage.deleteAll();
    }
    @Delete(":id")
    @Auth("ADMIN")
    async delete(@Param("id") id: string): Promise<void> {
        return this.blogImage.delete(id);
    }
}
