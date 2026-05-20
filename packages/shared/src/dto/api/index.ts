import { MessageKeyType } from "../../i18n";

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    pageCount: number;
}

export interface PagedResult<T> {
    data: T[];
    meta: PaginationMeta;
}

export interface ApiErrorResponse {
    status: number;
    message: string;
    code: string; // BAD_REQUEST, VALIDATION_ERROR
    data: any; // fieldErrors, details
    timestamp: string;
    path: string;
    context: "NEXT" | "API" | "NETWORK";
    errorType: "ApiErrorResponse";
}

export type FieldsMessages<T = Record<string, unknown>> = {
    [K in keyof T]?: MessageKeyType[];
};

export type RootErrorType = "error" | "warning" | "info";

export type RootError = {
    message: string;
    data?: Record<string, any>;
    type: RootErrorType;
};

export type ErrorsWithMessages<
    T extends Record<string, unknown> | never = never,
> = {
    fields?: FieldsMessages<T>;
    root?: RootError[];
};
