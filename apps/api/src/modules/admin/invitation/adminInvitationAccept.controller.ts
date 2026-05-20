import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { Public } from "@/modules/auth/decorators/public.decorator";
import { ENDPOINT, FULL_PATH_ENDPOINT } from "@myorg/shared/endpoints";
import { ZodValidationPipe } from "@/common/pipe/zod-validation";
import { AdminInvitationAcceptService } from "@/modules/admin/invitation/adminInvitationAccept.service";
import {
    RegisterByInvitationAdminSchema,
    RegisterByInvitationAdminDtoOutput,
} from "@myorg/shared/form";
import { AdminInvitationAcceptDto } from "@myorg/shared/dto";

const { path } = FULL_PATH_ENDPOINT.admin.invitation.accept;

@Public()
@Controller(path)
export class AdminInvitationAcceptController {
    constructor(private readonly service: AdminInvitationAcceptService) {}

    @Get()
    check(@Query("token") token: string): Promise<AdminInvitationAcceptDto> {
        return this.service.check(token);
    }

    @Post()
    register(
        @Query("token") token: string,
        @Body(new ZodValidationPipe(RegisterByInvitationAdminSchema))
        body: RegisterByInvitationAdminDtoOutput,
    ): Promise<void> {
        return this.service.register(token, body);
    }
}
