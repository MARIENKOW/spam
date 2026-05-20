import { PipeTransform, Injectable } from "@nestjs/common";
import { AllowedImageMimeType } from "../image.config";
import { AVATAR_CONFIG, AvatarUserInput } from "@myorg/shared/form";
import { ValidationException } from "@/common/exception/validation.exception";

@Injectable()
export class AvatarValidationPipe implements PipeTransform {
    constructor() {}

    async transform(
        file: Express.Multer.File | Express.Multer.File[] | undefined,
    ): Promise<Express.Multer.File | Express.Multer.File[]> {
        if (Array.isArray(file)) {
            return Promise.all(file.map((f) => this.validateOne(f)));
        }
        return this.validateOne(file);
    }

    private async validateOne(
        file: Express.Multer.File | undefined,
    ): Promise<Express.Multer.File> {
        if (!file) {
            throw new ValidationException<AvatarUserInput>({
                fields: { image: ["form.required"] },
            });
        }

        // Проверка реального типа по magic bytes — не доверяем заголовку
        const { fileTypeFromBuffer } = await import("file-type");
        const detected = await fileTypeFromBuffer(file.buffer);

        if (
            !detected ||
            !AVATAR_CONFIG.allowedMimeTypes.includes(
                detected.mime as AllowedImageMimeType,
            )
        ) {
            throw new ValidationException<AvatarUserInput>({
                fields: {
                    image: ["form.file.unsupportedType"],
                },
            });
        }

        // Подменяем mimetype на реальный — не тот что прислал клиент
        file.mimetype = detected.mime;

        // Проверка размера по конфигу сущности

        if (file.size > AVATAR_CONFIG.maxFileSizeBytes) {
            throw new ValidationException<AvatarUserInput>({
                fields: { image: ["form.file.avatar.tooLarge"] },
            });
        }

        return file;
    }
}
