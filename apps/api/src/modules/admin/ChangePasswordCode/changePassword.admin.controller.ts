import { Controller, Get, Post, Delete, Body, Res } from "@nestjs/common";
import { Auth, CurrentActor } from "@/modules/auth/decorators/auth.decorator";
import { AdminActor } from "@/modules/auth/auth.type";
import {
    ChangePasswordCodeAdminDtoOutput,
    ChangePasswordCodeAdminSchema,
    ChangePasswordAdminDtoOutput,
    ChangePasswordAdminSchema,
    ChangePasswordSettingsAdminDtoOutput,
    ChangePasswordSettingsAdminSchema,
} from "@myorg/shared/form";
import { ENDPOINT, FULL_PATH_ENDPOINT } from "@myorg/shared/endpoints";
import { ZodValidationPipe } from "@/common/pipe/zod-validation";
import { ChangePasswordAdminService } from "@/modules/admin/ChangePasswordCode/changePassword.admin.service";
import { Response } from "express";
import { COOKIE_CONFIG } from "@/modules/auth/admin/auth.admin.controller";
import { ChangePasswordStatus, MailSendSuccess } from "@myorg/shared/dto";

const { path } = FULL_PATH_ENDPOINT.admin.changePassword;
const { status, confirm, resend, init, initWithoutPassword, cancel } =
    ENDPOINT.admin.changePassword;

@Auth('ADMIN')
@Controller(path)
export class ChangePasswordAdminController {
    constructor(
        private readonly changePasswordService: ChangePasswordAdminService,
    ) {}

    @Get(status.path)
    getStatus(@CurrentActor() actor: AdminActor): Promise<ChangePasswordStatus> {
        return this.changePasswordService.getStatus(actor.admin);
    }

    @Post(init.path)
    initiate(
        @CurrentActor() actor: AdminActor,
        @Body(new ZodValidationPipe(ChangePasswordSettingsAdminSchema))
        body: ChangePasswordSettingsAdminDtoOutput,
    ): Promise<MailSendSuccess> {
        return this.changePasswordService.initiate(actor.admin, body);
    }

    @Post(initWithoutPassword.path)
    initiateWithoutPassword(
        @CurrentActor() actor: AdminActor,
        @Body(new ZodValidationPipe(ChangePasswordAdminSchema))
        body: ChangePasswordAdminDtoOutput,
    ): Promise<MailSendSuccess> {
        return this.changePasswordService.initiateWithoutPassword(
            actor.admin,
            body,
        );
    }

    @Post(confirm.path)
    async confirm(
        @CurrentActor() actor: AdminActor,
        @Body(new ZodValidationPipe(ChangePasswordCodeAdminSchema))
        body: ChangePasswordCodeAdminDtoOutput,
        @Res({ passthrough: true }) res: Response,
    ): Promise<void> {
        await this.changePasswordService.confirm(actor.admin.id, body);
        res.cookie("accessTokenAdmin", "", COOKIE_CONFIG);
        res.cookie("refreshTokenAdmin", "", COOKIE_CONFIG);
    }

    @Post(resend.path)
    resend(@CurrentActor() actor: AdminActor): Promise<MailSendSuccess> {
        return this.changePasswordService.resend(actor.admin);
    }

    @Delete(cancel.path)
    cancel(@CurrentActor() actor: AdminActor): Promise<void> {
        return this.changePasswordService.cancel(actor.admin.id);
    }
}
