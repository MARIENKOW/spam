import { Pagination } from "./pagination";

/**
 * Параметры list-запросов = Pagination & Filters.
 * Вынесены в lib/ (без React-импортов) — импортируются и в server components
 * (для SSR prefetch) и в client hooks.
 */

// --- Blog ---
export type BlogParams = Pagination & {
    order: "desc" | "asc";
    short: "all" | "yes" | "no";
    important: "all" | "yes" | "no";
    dateFrom: string;
    dateTo: string;
    query: string;
};
export const defaultBlogParams: BlogParams = {
    page: 1,
    order: "desc",
    short: "all",
    important: "all",
    dateFrom: "",
    dateTo: "",
    query: "",
};

// --- Invitation ---
type InvitationFilters = {
    status: "all" | "active" | "expired" | "revoked";
    order: "desc" | "asc";
    query: string;
};
export type InvitationParams = Pagination & InvitationFilters;
export const defaultInvitationParams: InvitationParams = {
    page: 1,
    status: "all",
    order: "desc",
    query: "",
};

// --- Admins ---
export type AdminParams = Pagination & {
    order: "desc" | "asc";
    sortBy: "createdAt" | "lastLoginAt" | "lastSeenAt";
    status: "all" | "active" | "blocked";
    query: string;
};
export const defaultAdminParams: AdminParams = {
    page: 1,
    order: "desc",
    sortBy: "createdAt",
    status: "all",
    query: "",
};

// --- Users ---
export type UserParams = Pagination & {
    order: "desc" | "asc";
    sortBy: "createdAt" | "lastLoginAt" | "lastSeenAt";
    status: "all" | "active" | "noactive" | "blocked";
    query: string;
};
export const defaultUserParams: UserParams = {
    page: 1,
    order: "desc",
    sortBy: "createdAt",
    status: "all",
    query: "",
};

// --- TgAccount ---
export type TgAccountParams = Pagination;
export const defaultTgAccountParams: TgAccountParams = { page: 1 };

// --- Video ---
export type VideoParams = Pagination;
export const defaultVideoParams: VideoParams = { page: 1 };

// --- Image ---
export type ImageParams = Pagination;
export const defaultImageParams: ImageParams = { page: 1 };
