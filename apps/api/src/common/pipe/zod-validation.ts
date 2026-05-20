import { ValidationException } from "@/common/exception/validation.exception";
import { ErrorsWithMessages, RootError } from "@myorg/shared/dto";
import { MessageKeyType } from "@myorg/shared/i18n";
import { PipeTransform } from "@nestjs/common";
import { ZodType } from "zod";

import { ZodError } from "zod";

export function zodIssuesToFieldErrors<T extends Record<string, unknown>>(
    error: ZodError,
): ErrorsWithMessages<T> {
    const fieldErrors: Record<string, MessageKeyType[]> = {};
    const rootErrors: RootError[] = [];

    for (const issue of error.issues) {
        const field = issue.path.join(".") || "root.server";

        if (!fieldErrors[field]) {
            fieldErrors[field] = [];
        }
        if (field === "root.server") {
            rootErrors.push({ message: issue.message, type: "error" });
        } else {
            fieldErrors[field].push(issue.message as MessageKeyType);
        }
    }

    return {
        fields: fieldErrors,
        root: rootErrors,
    };
}

export class ZodValidationPipe<S extends ZodType> implements PipeTransform {
    constructor(private schema: S) {}

    transform(value: unknown) {
        const result = this.schema.safeParse(value);
        if (!result.success) {
            throw new ValidationException(zodIssuesToFieldErrors(result.error));
        }
        return result.data;
    }
}
