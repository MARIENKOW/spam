import { ResetPasswordTokenAdminService } from "@/modules/auth/admin/resetPasswordToken/reset.password.token.admin.service";
import { Public } from "@/modules/auth/decorators/public.decorator";
import { ENDPOINT } from "@myorg/shared/endpoints";
import { Body, Controller, Post } from "@nestjs/common";

const { path, admin } = ENDPOINT.resetPasswordToken;

@Controller(path + "/" + admin.path)
export default class ResetPasswordTokenAdminController {
    constructor(private resetPassword: ResetPasswordTokenAdminService) {}
    @Post(admin.check.path)
    @Public()
    async check(
        @Body() body: { email?: string; token: string },
    ): Promise<true> {
        return await this.resetPassword.check(body);
    }
}
