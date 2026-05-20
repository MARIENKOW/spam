// src/modules/auth/auth.controller.ts
import {
    Controller,
    Post,
    Body,
    Res,
    Req,
    Param,
    Get,
    UnauthorizedException,
} from "@nestjs/common";
import { AuthUserService } from "@/modules/auth/user/auth.user.service";
import { ENDPOINT, FULL_PATH_ENDPOINT } from "@myorg/shared/endpoints";
import {
    ChangePasswordUserDtoOutput,
    ChangePasswordUserSchema,
    ForgotPasswordUserDtoOutput,
    ForgotPasswordUserSchema,
    LoginUserDtoOutput,
    LoginUserSchema,
    RegisterUserDtoOutput,
    RegisterUserSchema,
} from "@myorg/shared/form";
import { ZodValidationPipe } from "@/common/pipe/zod-validation";
import { CookieOptions, Request, Response } from "express";
import { Auth, CurrentActor } from "@/modules/auth/decorators/auth.decorator";
import { env } from "@/config";
import { Public } from "@/modules/auth/decorators/public.decorator";
import { UserActor } from "@/modules/auth/auth.type";

export const COOKIE_CONFIG: CookieOptions = {
    httpOnly: true,
    secure: env.HTTPS,
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней
    path: "/",
};

const { register, login, logout, forgotPassword, refresh, activate, google } =
    ENDPOINT.auth.user;

const { path } = FULL_PATH_ENDPOINT.auth.user;

@Controller(path)
export class AuthUserController {
    constructor(private authUser: AuthUserService) {}

    @Post(register.path)
    @Public()
    async register(
        @Body(new ZodValidationPipe(RegisterUserSchema))
        body: RegisterUserDtoOutput,
    ): Promise<string> {
        return this.authUser.register(body);
    }

    @Get(refresh.path)
    @Public()
    async refresh(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ): Promise<true> {
        const accessToken = req.cookies["accessTokenUser"];
        if (!accessToken) throw new UnauthorizedException();
        const refreshToken = req.cookies["refreshTokenUser"];
        if (!refreshToken) throw new UnauthorizedException();
        const { accessTokenUser, refreshTokenUser } =
            await this.authUser.refresh(refreshToken);
        res.cookie("accessTokenUser", accessTokenUser, COOKIE_CONFIG);
        res.cookie("refreshTokenUser", refreshTokenUser, COOKIE_CONFIG);
        return true;
    }

    @Post(login.path)
    @Public()
    async login(
        @Body(new ZodValidationPipe(LoginUserSchema)) body: LoginUserDtoOutput,
        @Res({ passthrough: true }) res: Response,
    ): Promise<true> {
        const { accessToken, refreshToken } = await this.authUser.login(body);
        res.cookie("accessTokenUser", accessToken, COOKIE_CONFIG);
        res.cookie("refreshTokenUser", refreshToken, COOKIE_CONFIG);
        return true;
    }
    @Post(google.path)
    @Public()
    async google(
        @Body() body: { code: string },
        @Res({ passthrough: true }) res: Response,
    ): Promise<true> {
        const { accessToken, refreshToken } = await this.authUser.google(body);
        res.cookie("accessTokenUser", accessToken, COOKIE_CONFIG);
        res.cookie("refreshTokenUser", refreshToken, COOKIE_CONFIG);
        return true;
    }

    @Post(forgotPassword.path)
    @Public()
    async forgotPassword(
        @Body(new ZodValidationPipe(ForgotPasswordUserSchema))
        body: ForgotPasswordUserDtoOutput,
    ): Promise<string> {
        return await this.authUser.forgotPassword(body);
    }

    @Post(forgotPassword.path + "/:token")
    @Public()
    async changePassword(
        @Body(new ZodValidationPipe(ChangePasswordUserSchema))
        body: ChangePasswordUserDtoOutput,
        @Param("token") token: string,
    ): Promise<true> {
        return await this.authUser.changePassword(body, { token });
    }

    @Post(activate.path)
    @Public()
    async activate(@Body() body: { token: string }): Promise<true> {
        return await this.authUser.activate(body);
    }
    @Post(activate.path + "/" + activate.send.path)
    @Public()
    async sendActivate(@Body() body: { email?: string }): Promise<string> {
        return await this.authUser.sendActivate(body);
    }

    @Post(logout.path)
    @Auth("USER")
    async logout(
        @CurrentActor() actor: UserActor,
        @Res({ passthrough: true }) res: Response,
    ): Promise<true> {
        await this.authUser.logout(actor.sessionId);
        res.cookie("accessTokenUser", "", COOKIE_CONFIG);
        res.cookie("refreshTokenUser", "", COOKIE_CONFIG);
        return true;
    }
}
