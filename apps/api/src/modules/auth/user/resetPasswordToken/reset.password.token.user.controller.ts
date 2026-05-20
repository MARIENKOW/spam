import { Public } from "@/modules/auth/decorators/public.decorator";
import { ResetPasswordTokenUserService } from "@/modules/auth/user/resetPasswordToken/reset.password.token.user.service";
import { ENDPOINT } from "@myorg/shared/endpoints";
import { Body, Controller, Post } from "@nestjs/common";

const { path, user } = ENDPOINT.resetPasswordToken;

@Controller(path + "/" + user.path)
export default class ResetPasswordTokenUserController {
    constructor(private resetPassword: ResetPasswordTokenUserService) {}
    @Post(user.check.path)
    @Public()
    async check(
        @Body() body: { email?: string; token: string },
    ): Promise<true> {
        return await this.resetPassword.check(body);
    }
}

