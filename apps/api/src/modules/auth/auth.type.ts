// auth.types.ts
export type AuthRole = "USER" | "ADMIN" | "SUPERADMIN";
export type AdminRole = "ADMIN" | "SUPERADMIN";
export type ActorType = "USER" | "ADMIN";
// actor.ts  — единственный источник правды об actor

import { Admin, User } from "@/generated/prisma";

export type UserActor = {
    type: "USER";
    user: User;
    sessionId: string;
};

export type AdminActor = {
    type: "ADMIN";
    admin: Admin;
    role: AdminRole;
    sessionId: string;
};

export type Actor = UserActor | AdminActor;

// Хелперы для type narrowing в контроллерах
export const isUserActor = (actor: Actor): actor is UserActor =>
    actor.type === "USER";

export const isAdminActor = (actor: Actor): actor is AdminActor =>
    actor.type === "ADMIN";

export const isSuperAdmin = (actor: Actor): actor is AdminActor =>
    isAdminActor(actor) && actor.role === 'SUPERADMIN';
