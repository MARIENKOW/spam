import {
    isApiErrorResponse,
    isUnauthorizedError,
} from "@/helpers/error/error.type.helper";
import { FetchBaseOptions, FetchCustomReturn } from "@/utils/api";
import { $apiClient } from "@/utils/api/fetch.client";
import { dispatchCustomEvent, EVENTS_KEYS } from "@/helpers/event.helper";
import AuthAdminService from "@/services/auth/admin/auth.admin.service";

// ─── Singleton ───────────────────────────────────────────────────
const { refresh } = new AuthAdminService($apiClient);

// ─── Default headers ─────────────────────────────────────────────
const DEFAULT_HEADERS: FetchBaseOptions["headers"] = {
    "x-type": "ADMIN",
};

const buildOptions = (options: FetchBaseOptions): FetchBaseOptions => ({
    ...options,
    headers: { ...DEFAULT_HEADERS, ...options.headers },
});

// ─── Main ─────────────────────────────────────────────────────────
export const $apiAdminClient = async <T>(
    path: string,
    options: FetchBaseOptions,
): FetchCustomReturn<T> => {
    try {
        return await $apiClient<T>(path, buildOptions(options));
    } catch (error) {
        // Не 401 — пробрасываем сразу
        if (!isApiErrorResponse(error) || !isUnauthorizedError(error as any)) {
            throw error;
        }

        // 401 — пробуем рефреш
        try {
            await refresh();
        } catch (refreshError) {
            // Рефреш не удался — сессия истекла
            dispatchCustomEvent(EVENTS_KEYS.UNAUTHORIZED);
            throw refreshError;
        }

        // Повторяем запрос с новым токеном
        try {
            return await $apiClient<T>(path, buildOptions(options));
        } catch (retryError) {
            if (
                isApiErrorResponse(retryError) &&
                isUnauthorizedError(retryError as any)
            ) {
                dispatchCustomEvent(EVENTS_KEYS.UNAUTHORIZED);
            }
            throw retryError;
        }
    }
};
