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
import { ENDPOINT, FULL_PATH_ENDPOINT } from "@myorg/shared/endpoints";
import {
    ChangePasswordAdminDtoOutput,
    ChangePasswordAdminSchema,
    ForgotPasswordAdminDtoOutput,
    ForgotPasswordAdminSchema,
    LoginAdminDtoOutput,
    LoginAdminSchema,
} from "@myorg/shared/form";
import { ZodValidationPipe } from "@/common/pipe/zod-validation";
import { CookieOptions, Request, Response } from "express";
import { AuthGuard } from "@/modules/auth/auth.guard";
import { Auth, CurrentActor } from "@/modules/auth/decorators/auth.decorator";
import { env } from "@/config";
import { AuthAdminService } from "@/modules/auth/admin/auth.admin.service";
import { Public } from "@/modules/auth/decorators/public.decorator";
import { AdminActor } from "@/modules/auth/auth.type";

export const COOKIE_CONFIG: CookieOptions = {
    httpOnly: true,
    secure: env.HTTPS,
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней
    path: "/",
};

const { login, logout, forgotPassword, refresh, google } = ENDPOINT.auth.admin;
const { path } = FULL_PATH_ENDPOINT.auth.admin;

@Controller(path)
export class AuthAdminController {
    constructor(private authAdmin: AuthAdminService) {}

    @Get(refresh.path)
    @Public()
    async refresh(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ): Promise<true> {
        const accessToken = req.cookies["accessTokenAdmin"];
        if (!accessToken) throw new UnauthorizedException();
        const refreshToken = req.cookies["refreshTokenAdmin"];
        if (!refreshToken) throw new UnauthorizedException();
        const { accessTokenAdmin, refreshTokenAdmin } =
            await this.authAdmin.refresh(refreshToken);
        res.cookie("accessTokenAdmin", accessTokenAdmin, COOKIE_CONFIG);
        res.cookie("refreshTokenAdmin", refreshTokenAdmin, COOKIE_CONFIG);
        return true;
    }

    @Post(login.path)
    @Public()
    async login(
        @Body(new ZodValidationPipe(LoginAdminSchema))
        body: LoginAdminDtoOutput,
        @Res({ passthrough: true }) res: Response,
    ): Promise<true> {
        const { accessToken, refreshToken } = await this.authAdmin.login(body);
        res.cookie("accessTokenAdmin", accessToken, COOKIE_CONFIG);
        res.cookie("refreshTokenAdmin", refreshToken, COOKIE_CONFIG);
        return true;
    }
    @Post(google.path)
    @Public()
    async google(
        @Body() body: { code: string },
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ): Promise<true> {
        const { accessToken, refreshToken } = await this.authAdmin.google(body);
        res.cookie("accessTokenAdmin", accessToken, COOKIE_CONFIG);
        res.cookie("refreshTokenAdmin", refreshToken, COOKIE_CONFIG);
        return true;
    }

    @Post(forgotPassword.path)
    @Public()
    async forgotPassword(
        @Body(new ZodValidationPipe(ForgotPasswordAdminSchema))
        body: ForgotPasswordAdminDtoOutput,
    ): Promise<string> {
        return await this.authAdmin.forgotPassword(body);
    }

    @Post(forgotPassword.path + "/:token")
    @Public()
    async changePassword(
        @Body(new ZodValidationPipe(ChangePasswordAdminSchema))
        body: ChangePasswordAdminDtoOutput,
        @Param("token") token: string,
    ): Promise<true> {
        return await this.authAdmin.changePassword(body, { token });
    }

    @Post(logout.path)
    @Auth("ADMIN")
    async logout(
        @CurrentActor() actor: AdminActor,
        @Res({ passthrough: true }) res: Response,
    ): Promise<true> {
        await this.authAdmin.logout(actor.sessionId);
        res.cookie("accessTokenAdmin", "", COOKIE_CONFIG);
        res.cookie("refreshTokenAdmin", "", COOKIE_CONFIG);
        return true;
    }
}
