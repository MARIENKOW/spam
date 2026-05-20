import { MessageKeyType } from "@myorg/shared/i18n";
import { FieldValues, Path, UseFormSetError } from "react-hook-form";
import {
    ErrorNormalizeContext,
    getErrorContext,
    normalizeError,
} from "@/helpers/error/error.type.helper";
import { snackbarError } from "@/utils/snackbar/snackbar.error";
import { FieldsMessages, RootErrorType } from "@myorg/shared/dto";
import { snackbarInfo } from "@/utils/snackbar/snackbar.info";
import { snackbarWarning } from "@/utils/snackbar/snackbar.warning";

type FallbackOptions = {
    message?: string[];
    type?: RootErrorType;
    callback?: () => void;
    hideMessage?: boolean;
};

const SnackbarByErrorType: { [K in RootErrorType]: (value: string) => void } = {
    error: snackbarError,
    info: snackbarInfo,
    warning: snackbarWarning,
};

export type FallbackType = {
    [K in ErrorNormalizeContext]?: FallbackOptions;
};

export function errorHandler({
    error,
    t,
    fallback,
}: {
    error: unknown;
    t: (key: MessageKeyType, options?: Record<string, any>) => string;
    fallback?: FallbackType;
}) {
    console.dir(error);
    const context = getErrorContext(error);
    const { root } = normalizeError({ error, t });

    const options = fallback?.[context];

    if (options?.hideMessage) {
        options.callback?.();
        return;
    }

    if (options?.message && options.message.length > 0) {
        const snackbar = SnackbarByErrorType[options.type || "error"];
        options.message.forEach(snackbar);
    } else {
        root?.forEach((err) => {
            const snackbar = SnackbarByErrorType[options?.type || err.type];
            snackbar(err.message);
        });
    }

    options?.callback?.();
}

export type FallbackFormType = {
    [K in ErrorNormalizeContext]?: {
        callback?: () => void;
        hideMessage?: boolean;
    };
};

export function errorFormHandlerWithAlert<T extends FieldValues>({
    error,
    setError,
    formValues,
    fallback,
    t,
}: {
    error: unknown;
    setError: UseFormSetError<T>;
    formValues: T;
    fallback?: FallbackFormType;
    t: (key: MessageKeyType, options?: Record<string, any>) => string;
}) {
    const context = getErrorContext(error);
    const { root, fields } = normalizeError<T>({ error, t });

    const options = fallback?.[context];

    if (options?.hideMessage) {
        options.callback?.();
        return;
    }

    if (root?.[0] && !options?.hideMessage) {
        setError("root.server", {
            type: "server",
            message: root[0].message,
        });
    }

    if (fields) {
        const newFields = fields as FieldValues;
        for (const key in newFields) {
            if (key in formValues) {
                setError(key as Path<T>, {
                    type: "server",
                    message: fields[key]?.[0],
                });
            }
        }
    }
    options?.callback?.();
}
export function errorFormHandler<T extends FieldValues>({
    error,
    setError,
    formValues,
    fallback,
    t,
}: {
    error: unknown;
    setError: UseFormSetError<T>;
    formValues: T;
    fallback?: FallbackFormType;
    t: (key: MessageKeyType, options?: Record<string, any>) => string;
}) {
    const context = getErrorContext(error);
    const { root, fields } = normalizeError<T>({ error, t });

    const options = fallback?.[context];

    if (options?.hideMessage) {
        options.callback?.();
        return;
    }

    if (root && root.length !== 0) {
        root.forEach((err) => {
            const snackbar = SnackbarByErrorType[err.type];
            snackbar(err.message);
        });
    }

    if (fields) {
        const newFields = fields as FieldValues;
        for (const key in newFields) {
            if (key in formValues) {
                setError(key as Path<T>, {
                    type: "server",
                    message: fields[key]?.[0],
                });
            }
        }
    }
    options?.callback?.();
}
