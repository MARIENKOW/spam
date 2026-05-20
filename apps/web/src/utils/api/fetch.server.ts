"use server";

import { getAllCookieToClient } from "@/actions/cookies.actions";
import { FetchBaseOptions, fetchCustom, FetchCustomReturn } from "@/utils/api";
import { API_SERVER_BASE_URL } from "@/utils/api/urls.server";

const DEFAULT_HEADERS: FetchBaseOptions["headers"] = {};

export const $apiServer = async <T>(
    path: string,
    options: FetchBaseOptions,
): FetchCustomReturn<T> => {
    const cookie = await getAllCookieToClient();

    return fetchCustom<T>(`${API_SERVER_BASE_URL}${path}`, {
        ...options,
        headers: { ...DEFAULT_HEADERS, cookie, ...options.headers },
    });
};
