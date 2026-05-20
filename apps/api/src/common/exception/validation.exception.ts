// src/common/exceptions/validation.exception.ts
import { ErrorsWithMessages } from "@myorg/shared/dto";
import { BadRequestException } from "@nestjs/common";

export class ValidationException<
    T extends Record<string, unknown> | never,
> extends BadRequestException {
    constructor(data: ErrorsWithMessages<T>) {
        super({
            message: "Validation failed",
            code: "VALIDATION_ERROR",
            data,
        });
    }
}
