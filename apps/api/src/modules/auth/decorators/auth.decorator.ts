// auth.decorator.ts
import { AdminActor, AuthRole, UserActor } from "@/modules/auth/auth.type";
import { SetMetadata } from "@nestjs/common";
import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { Request } from "express";

export const AUTH_ROLES_KEY = "auth:roles";
export const Auth = (...roles: AuthRole[]) =>
    SetMetadata(AUTH_ROLES_KEY, roles);

export const CurrentActor = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): AdminActor | UserActor => {
        const req = ctx.switchToHttp().getRequest<Request>();
        return req.actor as AdminActor | UserActor;
    },
);
