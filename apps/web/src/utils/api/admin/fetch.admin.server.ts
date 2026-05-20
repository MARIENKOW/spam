"use server";

import { FetchBaseOptions, FetchCustomReturn } from "@/utils/api";
import { $apiServer } from "@/utils/api/fetch.server";

const DEFAULT_HEADERS: FetchBaseOptions["headers"] = {
    "x-type": "ADMIN",
};

export const $apiAdminServer = async <T>(
    path: string,
    options: FetchBaseOptions,
): FetchCustomReturn<T> => {
    return $apiServer<T>(path, {
        ...options,
        headers: { ...DEFAULT_HEADERS, ...options.headers },
    });
};
