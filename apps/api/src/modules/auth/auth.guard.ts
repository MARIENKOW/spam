// auth.guard.ts
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
    ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { AUTH_ROLES_KEY } from "@/modules/auth/decorators/auth.decorator";
import { IS_PUBLIC_KEY } from "@/modules/auth/decorators/public.decorator";
import {
    AuthRole,
    AdminRole,
    ActorType,
    Actor,
} from "@/modules/auth/auth.type";

import { UserService } from "@/modules/user/user.service";
import { AdminService } from "@/modules/admin/admin.service";
import {
    SessionUserService,
    AccessTokenUserPayload,
} from "@/modules/auth/user/session/session.user.service";
import {
    SessionAdminService,
    AccessTokenAdminPayload,
} from "@/modules/auth/admin/session/session.admin.service";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly sessionUser: SessionUserService,
        private readonly sessionAdmin: SessionAdminService,
        private readonly user: UserService,
        private readonly admin: AdminService,
    ) {}

    async canActivate(ctx: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(
            IS_PUBLIC_KEY,
            [ctx.getHandler(), ctx.getClass()],
        );
        if (isPublic) return true;

        const allowedRoles = this.reflector.getAllAndOverride<AuthRole[]>(
            AUTH_ROLES_KEY,
            [ctx.getHandler(), ctx.getClass()],
        );

        // Нет декоратора @Auth() — роут закрыт
        if (!allowedRoles?.length) throw new UnauthorizedException();

        const req = ctx.switchToHttp().getRequest<Request>();
        const xType = req.headers["x-type"] as string | undefined;

        const actorType = this.resolveActorType(
            xType,
            allowedRoles,
            req.cookies,
        );
        if (!actorType) throw new UnauthorizedException();

        const actor =
            actorType === "USER"
                ? await this.buildUserActor(req.cookies)
                : await this.buildAdminActor(req.cookies);

        this.assertRoleAllowed(actor, allowedRoles);

        req.actor = actor;
        await this.touch(actor);

        return true;
    }

    // Определяем с кем работаем: user или admin
    // x-type имеет приоритет (нужен когда роут открыт для обоих)
    // 1. resolveActorType по куки
    private resolveActorType(
        xType: string | undefined,
        allowedRoles: AuthRole[],
        cookies: Record<string, string>,
    ): ActorType | null {
        if (xType === "USER" || xType === "ADMIN") return xType;

        const needsUser = allowedRoles.includes("USER");
        const needsAdmin = allowedRoles.some(
            (r) => r === "ADMIN" || r === "SUPERADMIN",
        );

        if (needsUser && needsAdmin) {
            if (cookies.accessTokenAdmin) return "ADMIN";
            if (cookies.accessTokenUser) return "USER";
            return null;
        }

        if (needsUser) return "USER";
        if (needsAdmin) return "ADMIN";
        return null;
    }


    // Проверяем что роль актора входит в разрешённые для этого роута
    private assertRoleAllowed(actor: Actor, allowedRoles: AuthRole[]): void {
        if (actor.type === "USER" && allowedRoles.includes("USER")) return;

        if (actor.type === "ADMIN") {
            const hasAdminRole = allowedRoles.some(
                (r) => r === "ADMIN" || r === "SUPERADMIN",
            );
            if (!hasAdminRole) throw new ForbiddenException(); // ← сначала это

            if (actor.role === "SUPERADMIN") return;
            if (allowedRoles.includes(actor.role)) return;
        }

        throw new ForbiddenException();
    }

    private async buildUserActor(
        cookies: Record<string, string>,
    ): Promise<Actor> {
        const token = cookies.accessTokenUser;
        if (!token) throw new UnauthorizedException();

        let payload: AccessTokenUserPayload;
        try {
            payload = this.sessionUser.verifyAccessToken(token);
        } catch {
            throw new UnauthorizedException();
        }

        const session = await this.sessionUser.findById(payload.sessionId);
        if (!session) throw new UnauthorizedException();

        const user = await this.user.findById(session.userId);
        if (!user || user.status !== "ACTIVE")
            throw new UnauthorizedException();

        return { type: "USER", user, sessionId: session.id };
    }

    private async buildAdminActor(
        cookies: Record<string, string>,
    ): Promise<Actor> {
        const token = cookies.accessTokenAdmin;
        if (!token) throw new UnauthorizedException();

        let payload: AccessTokenAdminPayload;
        try {
            payload = this.sessionAdmin.verifyAccessToken(token);
        } catch {
            throw new UnauthorizedException();
        }

        const session = await this.sessionAdmin.findById(payload.sessionId);
        if (!session) throw new UnauthorizedException();

        const admin = await this.admin.findById(session.adminId);
        if (!admin || admin.status !== "ACTIVE")
            throw new UnauthorizedException();

        const role = admin.role as AdminRole;

        return { type: "ADMIN", admin, role, sessionId: session.id };
    }

    private async touch(actor: Actor): Promise<void> {
        if (actor.type === "USER") {
            await this.sessionUser.touch(actor.sessionId);
        } else {
            await this.sessionAdmin.touch(actor.sessionId);
        }
    }
}
