// src/modules/auth/auth.controller.ts
import {
    Controller,
    Delete,
    ForbiddenException,
    Get,
    Param,
} from "@nestjs/common";
import { FULL_PATH_ENDPOINT } from "@myorg/shared/endpoints";
import { Auth, CurrentActor } from "@/modules/auth/decorators/auth.decorator";

import { AdminActor } from "@/modules/auth/auth.type";
import { SessionAdminDto, SessionAdminViewDto } from "@myorg/shared/dto";
import { SessionAdminService } from "@/modules/auth/admin/session/session.admin.service";

const { path } = FULL_PATH_ENDPOINT.auth.admin.session;

@Controller(path)
export class SessionAdminController {
    constructor(private session: SessionAdminService) {}

    @Get("")
    @Auth("ADMIN")
    async getMe(
        @CurrentActor()
        actor: AdminActor,
    ): Promise<SessionAdminViewDto[]> {
        return this.session.getMe(actor.admin, actor.sessionId);
    }
    @Delete(":id")
    @Auth("ADMIN")
    async revoke(
        @CurrentActor() actor: AdminActor,
        @Param("id") id: string,
    ): Promise<void> {
        return this.session.revoke({
            sessionId: id,
            currentSession: actor.sessionId,
        });
    }
}
