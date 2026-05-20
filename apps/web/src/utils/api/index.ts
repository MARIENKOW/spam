import { isAbort } from "@/helpers/error/error.type.helper";
import { ApiErrorResponse } from "@myorg/shared/dto";
import { HTTP_STATUSES } from "@myorg/shared/http";

export interface FetchBaseOptions extends RequestInit {
    method?: "POST" | "GET" | "PUT" | "DELETE" | "PATCH";
    body?: BodyInit | null;
}

export type FetchCustom = <T>(
    path: string,
    options: FetchBaseOptions,
) => FetchCustomReturn<T>;

export type FetchCustomReturn<T> = Promise<Response & { data: T }>;

// ─── Helpers ──────────────────────────────────────────────────────

const makeError = (
    overrides: Partial<ApiErrorResponse> & {
        status: number;
        code: number | string;
    },
    path: string,
    context: ApiErrorResponse["context"],
    e?: unknown,
): ApiErrorResponse => ({
    status: overrides.status,
    code: overrides.code,
    message:
        e instanceof Error ? e.message : (overrides.message ?? "Unknown error"),
    data: overrides.data ?? undefined,
    timestamp: overrides.timestamp ?? new Date().toISOString(),
    path: overrides.path ?? path,
    context,
    errorType: "ApiErrorResponse",
});

const parseBody = async (res: Response): Promise<unknown> => {
    const text = await res.text();
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
};

// ─── Main ─────────────────────────────────────────────────────────

export async function fetchCustom<T>(
    path: string,
    options: FetchBaseOptions = {},
): FetchCustomReturn<T> {
    let res: Response;

    try {
        res = await fetch(path, options);
    } catch (e) {
        const httpStatus = isAbort(e)
            ? HTTP_STATUSES.AbortError
            : HTTP_STATUSES.NetworkError;

        throw makeError(
            {
                status: httpStatus.status,
                code: httpStatus.code,
                message: httpStatus.statusText,
            },
            path,
            "NETWORK",
            e,
        );
    }

    if (!res.ok) {
        let data: any = {};
        try {
            data = await res.json();
        } catch {}

        throw makeError(
            data.context === "NEXT"
                ? {
                      status: res.status,
                      code: data.code,
                      message: data.message,
                      data: data.data,
                      timestamp: data.timestamp,
                      path: data.path,
                  }
                : {
                      status: res.status,
                      code: data?.code ?? data?.error ?? `HTTP_${res.status}`,
                      message: data?.message ?? res.statusText,
                      data:
                          data?.data ??
                          (typeof data === "object" ? data : undefined),
                      timestamp: data?.timestamp,
                      path: data?.path ?? res.url,
                  },
            path,
            data.context === "NEXT" ? "NEXT" : "API",
        );
    }

    const body = await parseBody(res);
    return Object.assign(res, { data: body as T });
}
