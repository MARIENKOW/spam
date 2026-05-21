import { Auth, CurrentActor } from "@/modules/auth/decorators/auth.decorator";
import { AdminActor } from "@/modules/auth/auth.type";
import { TgAccountDto, TgAccountStartResponseDto, TgAccountVerifyResponseDto, PagedResult } from "@myorg/shared/dto";
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
