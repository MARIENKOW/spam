import { Auth } from "@/modules/auth/decorators/auth.decorator";
import { BlogDto, PagedResult } from "@myorg/shared/dto";
import { ENDPOINT, FULL_PATH_ENDPOINT } from "@myorg/shared/endpoints";
import {
    Body,
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Put,
    Query,
    UploadedFile,
    UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { BlogService } from "@/modules/blog/blog.service";
import { ZodValidationPipe } from "@/common/pipe/zod-validation";
import {
    BlogSchemaWithoutImage,
    BlogWithoutImageOutput,
} from "@myorg/shared/form";
import { blogMainImageValidationPipe } from "@/infrastructure/file/img/pipes/blogMainImage.pipe";

const {} = ENDPOINT.blog;
const { path } = FULL_PATH_ENDPOINT.blog;

@Controller(path)
export class BlogController {
    constructor(private blog: BlogService) {}

    @Post()
    @Auth("ADMIN")
    @UseInterceptors(FileInterceptor("image", { storage: memoryStorage() }))
    async create(
        @Body(new ZodValidationPipe(BlogSchemaWithoutImage))
        body: BlogWithoutImageOutput,
        @UploadedFile(new blogMainImageValidationPipe({ required: true }))
        file: Express.Multer.File,
    ): Promise<BlogDto> {
        return this.blog.create(body, file);
    }

    @Put(":id")
    @Auth("ADMIN")
    @UseInterceptors(FileInterceptor("image", { storage: memoryStorage() }))
    async update(
        @Body(new ZodValidationPipe(BlogSchemaWithoutImage))
        data: BlogWithoutImageOutput & { image: string | null },
        @UploadedFile(new blogMainImageValidationPipe({ required: false }))
        file: Express.Multer.File | null,
        @Param("id") id: string,
    ): Promise<BlogDto> {
        return this.blog.update({ id, data, image: file });
    }

    @Get()
    @Auth("ADMIN")
    async getAll(
        @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query("limit", new DefaultValuePipe(6), ParseIntPipe) limit: number,
        @Query("order") order: string = "desc",
        @Query("short") short: string = "all",
        @Query("important") important: string = "all",
        @Query("dateFrom") dateFrom: string = "",
        @Query("dateTo") dateTo: string = "",
        @Query("query") query: string = "",
    ): Promise<PagedResult<BlogDto>> {
        return this.blog.getAll(page, limit, order, short, important, dateFrom, dateTo, query);
    }
    @Get(":id")
    @Auth("ADMIN")
    async get(@Param("id") id: string): Promise<BlogDto> {
        return this.blog.get(id);
    }

    @Delete()
    @Auth("ADMIN")
    async deleteAll(): Promise<void> {
        return this.blog.deleteAll();
    }

    @Delete(":id")
    @Auth("ADMIN")
    async delete(@Param("id") id: string): Promise<void> {
        return this.blog.delete(id);
    }

    @Patch(":id/main")
    @Auth("ADMIN")
    async setMain(@Param("id") id: string): Promise<BlogDto> {
        return this.blog.setMain(id);
    }

    @Patch(":id/important")
    @Auth("ADMIN")
    async setImportant(@Param("id") id: string): Promise<BlogDto> {
        return this.blog.setImportant(id);
    }

    @Patch(":id/short")
    @Auth("ADMIN")
    async setShort(@Param("id") id: string): Promise<BlogDto> {
        return this.blog.setShort(id);
    }
}
