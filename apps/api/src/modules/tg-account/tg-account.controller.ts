import { Auth, CurrentActor } from "@/modules/auth/decorators/auth.decorator";
import { AdminActor } from "@/modules/auth/auth.type";
import {
    TgAccountDto,
    TgAccountStartResponseDto,
    TgAccountVerifyResponseDto,
    TgAccountQrStartResponseDto,
    TgAccountQrPollResponseDto,
    TgAccountQrVerify2faResponseDto,
    PagedResult,
} from "@myorg/shared/dto";
import { ENDPOINT, FULL_PATH_ENDPOINT } from "@myorg/shared/endpoints";
import { TgAccountStartSchema, TgAccountStartOutput, TgAccountVerifySchema, TgAccountVerifyOutput } from "@myorg/shared/form";
import {
    Body,
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Query,
} from "@nestjs/common";
import { TgAccountService } from "@/modules/tg-account/tg-account.service";
import { ZodValidationPipe } from "@/common/pipe/zod-validation";

const { path } = FULL_PATH_ENDPOINT.tgAccount;
const { auth } = ENDPOINT.tgAccount;
const QR = `${auth.path}/${auth.qr.path}`;

@Controller(path)
export class TgAccountController {
    constructor(private readonly tgAccount: TgAccountService) {}

    @Post(`${auth.path}/${auth.start.path}`)
    @Auth("ADMIN")
    async authStart(
        @Body(new ZodValidationPipe(TgAccountStartSchema)) body: TgAccountStartOutput,
        @CurrentActor() actor: AdminActor,
    ): Promise<TgAccountStartResponseDto> {
        return this.tgAccount.authStart(body.phone, actor.admin.id);
    }

    @Post(`${auth.path}/${auth.verify.path}`)
    @Auth("ADMIN")
    async authVerify(
        @Body(new ZodValidationPipe(TgAccountVerifySchema)) body: TgAccountVerifyOutput,
        @CurrentActor() actor: AdminActor,
    ): Promise<TgAccountVerifyResponseDto> {
        return this.tgAccount.authVerify(body.phone, body.phoneCodeHash, body.code, actor.admin.id, body.password);
    }

    @Post(`${QR}/${auth.qr.start.path}`)
    @Auth("ADMIN")
    async qrStart(
        @CurrentActor() actor: AdminActor,
    ): Promise<TgAccountQrStartResponseDto> {
        return this.tgAccount.qrStart(actor.admin.id);
    }

    @Get(`${QR}/:sessionId`)
    @Auth("ADMIN")
    async qrPoll(
        @Param("sessionId") sessionId: string,
        @CurrentActor() actor: AdminActor,
    ): Promise<TgAccountQrPollResponseDto> {
        return this.tgAccount.qrPoll(sessionId, actor.admin.id);
    }

    @Post(`${QR}/:sessionId/verify2fa`)
    @Auth("ADMIN")
    async qrVerify2fa(
        @Param("sessionId") sessionId: string,
        @Body() body: { password: string },
        @CurrentActor() actor: AdminActor,
    ): Promise<TgAccountQrVerify2faResponseDto> {
        return this.tgAccount.qrVerify2fa(sessionId, body.password, actor.admin.id);
    }

    @Delete(`${QR}/:sessionId`)
    @Auth("ADMIN")
    async qrCancel(
        @Param("sessionId") sessionId: string,
        @CurrentActor() actor: AdminActor,
    ): Promise<void> {
        return this.tgAccount.qrCancel(sessionId, actor.admin.id);
    }

    @Get()
    @Auth("ADMIN")
    async getAll(
        @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query("limit", new DefaultValuePipe(12), ParseIntPipe) limit: number,
        @Query("order") order: string = "desc",
        @Query("status") status: string = "all",
        @Query("query") query: string = "",
        @CurrentActor() actor: AdminActor,
    ): Promise<PagedResult<TgAccountDto>> {
        return this.tgAccount.getAll(page, limit, order as "asc" | "desc", status, query, actor.admin.id, actor.role);
    }

    @Delete(":id")
    @Auth("ADMIN")
    async delete(
        @Param("id") id: string,
        @CurrentActor() actor: AdminActor,
    ): Promise<void> {
        return this.tgAccount.delete(id, actor.admin.id, actor.role);
    }
}
