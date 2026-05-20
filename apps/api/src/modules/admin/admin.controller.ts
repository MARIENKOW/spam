import { Auth, CurrentActor } from "@/modules/auth/decorators/auth.decorator";
import { mapAdmin } from "@/modules/admin/admin.mapper";
import { AdminService } from "@/modules/admin/admin.service";
import { AdminDto, ImageDto } from "@myorg/shared/dto";
import { ENDPOINT, FULL_PATH_ENDPOINT } from "@myorg/shared/endpoints";
import {
    Body,
    Controller,
    Delete,
    Get,
    Post,
    Put,
    Req,
    UploadedFile,
    UseInterceptors,
} from "@nestjs/common";
import { Request } from "express";
import { AdminActor } from "@/modules/auth/auth.type";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { AvatarValidationPipe } from "@/infrastructure/file/img/pipes/avatar.pipe";

const { me, theme, locale, avatar } = ENDPOINT.admin;
const { path } = FULL_PATH_ENDPOINT.admin;

@Controller(path)
export class AdminController {
    constructor(private admin: AdminService) {}
    @Get(me.path)
    @Auth("ADMIN")
    async me(@CurrentActor() actor: AdminActor): Promise<AdminDto> {
        return this.admin.me(actor.admin);
    }
    @Put(theme.path)
    @Auth("ADMIN")
    async theme(
        @Req() req: Request,
        @CurrentActor() actor: AdminActor,
        @Body() body: { theme: string },
    ): Promise<true> {
        return this.admin.changeTheme({
            id: actor.admin.id,
            theme: body.theme,
        });
    }
    @Put(locale.path)
    @Auth("ADMIN")
    async locale(
        @CurrentActor() actor: AdminActor,
        @Body() body: { locale: string },
    ): Promise<true> {
        return this.admin.changeLocale({
            id: actor.admin.id,
            locale: body.locale,
        });
    }
    @Post(avatar.path)
    @UseInterceptors(FileInterceptor("image", { storage: memoryStorage() }))
    @Auth("ADMIN")
    async changeAvatar(
        @UploadedFile(new AvatarValidationPipe())
        file: Express.Multer.File,
        @CurrentActor() actor: AdminActor,
    ): Promise<ImageDto> {
        return this.admin.changeAvatar({
            admin: actor.admin,
            file,
        });
    }
    @Delete(avatar.path)
    @Auth("ADMIN")
    async deleteAvatar(@CurrentActor() actor: AdminActor): Promise<void> {
        return this.admin.deleteAvatar(actor.admin);
    }
}
