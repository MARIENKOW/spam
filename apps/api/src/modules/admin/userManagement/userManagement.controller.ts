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
import { UserManagementService } from "@/modules/admin/userManagement/userManagement.service";
import { UserManagementDto, PagedResult, SessionUserViewDto } from "@myorg/shared/dto";
import { UpdateNoteUserManagementSchema, UpdateNoteUserManagementDtoOutput } from "@myorg/shared/form";

const { path } = FULL_PATH_ENDPOINT.admin.users;
const { block, activate, note, sessions } = ENDPOINT.admin.users;

@Auth("ADMIN")
@Controller(path)
export class UserManagementController {
    constructor(private readonly service: UserManagementService) {}

    @Get()
    getAll(
        @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query("limit", new DefaultValuePipe(12), ParseIntPipe) limit: number,
        @Query("order", new DefaultValuePipe("desc")) order: string,
        @Query("sortBy", new DefaultValuePipe("createdAt")) sortBy: string,
        @Query("status", new DefaultValuePipe("all")) status: string,
        @Query("query", new DefaultValuePipe("")) query: string,
    ): Promise<PagedResult<UserManagementDto>> {
        return this.service.getAll(page, limit, order, sortBy, status, query);
    }

    @Patch(`:id/${block.path}`)
    block(@Param("id") id: string): Promise<UserManagementDto> {
        return this.service.block(id);
    }

    @Patch(`:id/${activate.path}`)
    activate(@Param("id") id: string): Promise<UserManagementDto> {
        return this.service.activate(id);
    }

    @Delete(":id")
    delete(@Param("id") id: string): Promise<void> {
        return this.service.delete(id);
    }

    @Get(`:id/${sessions.path}`)
    getSessions(@Param("id") id: string): Promise<SessionUserViewDto[]> {
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
        @Body(new ZodValidationPipe(UpdateNoteUserManagementSchema))
        body: UpdateNoteUserManagementDtoOutput,
    ): Promise<UserManagementDto> {
        return this.service.updateNote(id, body);
    }
}
