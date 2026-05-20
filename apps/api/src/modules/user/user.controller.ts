import { Auth, CurrentActor } from "@/modules/auth/decorators/auth.decorator";
import { mapUser } from "@/modules/user/user.mapper";
import { UserService } from "@/modules/user/user.service";
import { ImageDto, UserDto } from "@myorg/shared/dto";
import { ENDPOINT, FULL_PATH_ENDPOINT } from "@myorg/shared/endpoints";
import {
    Body,
    Controller,
    Delete,
    Get,
    Post,
    Put,
    Req,
    UnauthorizedException,
    UploadedFile,
    UseInterceptors,
} from "@nestjs/common";
import { Request } from "express";
import { isUserActor, UserActor } from "@/modules/auth/auth.type";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { AvatarValidationPipe } from "@/infrastructure/file/img/pipes/avatar.pipe";

const { me, theme, locale, avatar } = ENDPOINT.user;
const { path } = FULL_PATH_ENDPOINT.user;

@Controller(path)
export class UserController {
    constructor(private user: UserService) {}
    @Get(me.path)
    @Auth("USER")
    async me(@CurrentActor() actor: UserActor): Promise<UserDto> {
        return this.user.me(actor.user);
    }
    @Put(theme.path)
    @Auth("USER")
    async theme(
        @CurrentActor() actor: UserActor,
        @Body() body: { theme: string },
    ): Promise<true> {
        return this.user.changeTheme({
            id: actor.user.id,
            theme: body.theme,
        });
    }
    @Put(locale.path)
    @Auth("USER")
    async locale(
        @Req() req: Request,
        @Body() body: { locale: string },
    ): Promise<true> {
        if (!req.actor || !isUserActor(req.actor))
            throw new UnauthorizedException();
        return this.user.changeLocale({
            id: req.actor.user.id,
            locale: body.locale,
        });
    }
    @Post(avatar.path)
    @UseInterceptors(FileInterceptor("image", { storage: memoryStorage() }))
    @Auth("USER")
    async changeAvatar(
        @UploadedFile(new AvatarValidationPipe())
        file: Express.Multer.File,
        @CurrentActor() actor: UserActor,
    ): Promise<ImageDto> {
        return this.user.changeAvatar({
            user: actor.user,
            file,
        });
    }
    @Delete(avatar.path)
    @Auth("USER")
    async deleteAvatar(@CurrentActor() actor: UserActor): Promise<void> {
        return this.user.deleteAvatar(actor.user);
    }
}
