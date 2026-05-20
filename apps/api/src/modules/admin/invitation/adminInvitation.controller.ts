import {
    Body,
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
} from "@nestjs/common";
import { Auth } from "@/modules/auth/decorators/auth.decorator";
import { ENDPOINT, FULL_PATH_ENDPOINT } from "@myorg/shared/endpoints";
import { ZodValidationPipe } from "@/common/pipe/zod-validation";
import { AdminInvitationService } from "@/modules/admin/invitation/adminInvitation.service";
import {
    CreateAdminInvitationSchema,
    CreateAdminInvitationDtoOutput,
    UpdateNoteAdminInvitationSchema,
    UpdateNoteAdminInvitationDtoOutput,
} from "@myorg/shared/form";
import { AdminInvitationDto, PagedResult } from "@myorg/shared/dto";

const { path } = FULL_PATH_ENDPOINT.admin.invitation;
const { revoke, unrevoke, resend, note } = ENDPOINT.admin.invitation;

@Auth("SUPERADMIN")
@Controller(path)
export class AdminInvitationController {
    constructor(private readonly service: AdminInvitationService) {}

    @Get()
    getAll(
        @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query("limit", new DefaultValuePipe(6), ParseIntPipe) limit: number,
        @Query("status", new DefaultValuePipe("all")) status: string,
        @Query("order", new DefaultValuePipe("desc")) order: string,
        @Query("query", new DefaultValuePipe("")) query: string,
    ): Promise<PagedResult<AdminInvitationDto>> {
        return this.service.getAll(page, limit, status, order, query);
    }

    @Post()
    create(
        @Body(new ZodValidationPipe(CreateAdminInvitationSchema))
        body: CreateAdminInvitationDtoOutput,
    ): Promise<AdminInvitationDto> {
        return this.service.create(body);
    }

    @Delete(":id")
    delete(@Param("id") id: string): Promise<void> {
        return this.service.delete(id);
    }

    @Patch(`:id/${revoke.path}`)
    revoke(@Param("id") id: string): Promise<AdminInvitationDto> {
        return this.service.revoke(id);
    }

    @Patch(`:id/${unrevoke.path}`)
    unrevoke(@Param("id") id: string): Promise<AdminInvitationDto> {
        return this.service.unrevoke(id);
    }

    @Post(`:id/${resend.path}`)
    resend(@Param("id") id: string): Promise<AdminInvitationDto> {
        return this.service.resend(id);
    }

    @Patch(`:id/${note.path}`)
    updateNote(
        @Param("id") id: string,
        @Body(new ZodValidationPipe(UpdateNoteAdminInvitationSchema))
        body: UpdateNoteAdminInvitationDtoOutput,
    ): Promise<AdminInvitationDto> {
        return this.service.updateNote(id, body);
    }
}
