import {
    Body,
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Query,
} from "@nestjs/common";
import { Auth } from "@/modules/auth/decorators/auth.decorator";
import { ENDPOINT, FULL_PATH_ENDPOINT } from "@myorg/shared/endpoints";
import { ZodValidationPipe } from "@/common/pipe/zod-validation";
import { AdminManagementService } from "@/modules/admin/management/adminManagement.service";
import { AdminManagementDto, PagedResult, SessionAdminViewDto } from "@myorg/shared/dto";
import {
    UpdateNoteAdminManagementSchema,
    UpdateNoteAdminManagementDtoOutput,
} from "@myorg/shared/form";

const { path } = FULL_PATH_ENDPOINT.admin.admins;
const { block, unblock, note, sessions } = ENDPOINT.admin.admins;

@Auth("SUPERADMIN")
@Controller(path)
export class AdminManagementController {
    constructor(private readonly service: AdminManagementService) {}

    @Get()
    getAll(
        @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query("limit", new DefaultValuePipe(12), ParseIntPipe) limit: number,
        @Query("order", new DefaultValuePipe("desc")) order: string,
        @Query("sortBy", new DefaultValuePipe("createdAt")) sortBy: string,
        @Query("status", new DefaultValuePipe("all")) status: string,
        @Query("query", new DefaultValuePipe("")) query: string,
    ): Promise<PagedResult<AdminManagementDto>> {
        return this.service.getAll(page, limit, order, sortBy, status, query);
    }

    @Patch(`:id/${block.path}`)
    block(@Param("id") id: string): Promise<AdminManagementDto> {
        return this.service.block(id);
    }

    @Patch(`:id/${unblock.path}`)
    unblock(@Param("id") id: string): Promise<AdminManagementDto> {
        return this.service.unblock(id);
    }

    @Delete(":id")
    delete(@Param("id") id: string): Promise<void> {
        return this.service.delete(id);
    }

    @Get(`:id/${sessions.path}`)
    getSessions(@Param("id") id: string): Promise<SessionAdminViewDto[]> {
        return this.service.getSessions(id);
    }

    @Delete(`:id/${sessions.path}`)
    deleteAllSessions(@Param("id") id: string): Promise<void> {
        return this.service.deleteAllSessions(id);
    }

    @Delete(`:id/${sessions.path}/:sessionId`)
    deleteSession(@Param("sessionId") sessionId: string): Promise<void> {
        return this.service.deleteSession(sessionId);
    }

    @Patch(`:id/${note.path}`)
    updateNote(
        @Param("id") id: string,
        @Body(new ZodValidationPipe(UpdateNoteAdminManagementSchema))
        body: UpdateNoteAdminManagementDtoOutput,
    ): Promise<AdminManagementDto> {
        return this.service.updateNote(id, body);
    }
}
