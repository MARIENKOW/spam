import { FetchBaseOptions, fetchCustom, FetchCustomReturn } from "@/utils/api";
import { API_CLIENT_BASE_URL } from "@/utils/api/urls.client";

const DEFAULT_OPTIONS: FetchBaseOptions = {
    credentials: "include",

};

export const $apiClient = <T>(
    path: string,
    options: FetchBaseOptions,
): FetchCustomReturn<T> =>
    fetchCustom<T>(`${API_CLIENT_BASE_URL}${path}`, {
        ...DEFAULT_OPTIONS,
        ...options,
        headers: { ...DEFAULT_OPTIONS.headers, ...options.headers },
    });
