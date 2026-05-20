import {
    isApiErrorResponse,
    isUnauthorizedError,
} from "@/helpers/error/error.type.helper";
import AdminService from "@/services/admin/admin.service";
import { ApiErrorResponse, AdminDto } from "@myorg/shared/dto";
import { cache } from "react";
import { $apiAdminServer } from "@/utils/api/admin/fetch.admin.server";

type CachedAdminMeReturn = Promise<{
    admin: AdminDto | null;
    error: boolean;
}>;

export const getAdminAuth: () => CachedAdminMeReturn = cache(async () => {
    let admin = null;
    let error = false;
    try {
        const adminService = new AdminService($apiAdminServer);
        const res = await adminService.me();
        admin = res.data;
    } catch (e) {
        if (
            !isApiErrorResponse(e) ||
            !isUnauthorizedError(e as ApiErrorResponse)
        )
            error = true;
    }
    return { admin, error };
});
