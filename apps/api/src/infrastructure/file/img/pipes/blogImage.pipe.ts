import { PipeTransform, Injectable } from "@nestjs/common";
import { AllowedImageMimeType } from "../image.config";
import { BLOG_IMAGE_CONFIG, BlogSchema } from "@myorg/shared/form";
import { ValidationException } from "@/common/exception/validation.exception";
import { MessageStructure } from "@myorg/shared/i18n";
import { I18nService } from "nestjs-i18n";

@Injectable()
export class BlogImageValidationPipe implements PipeTransform {
    constructor(private i18n: I18nService<MessageStructure>) {}

    async transform(
        file: Express.Multer.File | undefined,
    ): Promise<Express.Multer.File> {
        return this.validateOne(file);
    }

    private async validateOne(
        file: Express.Multer.File | undefined,
    ): Promise<Express.Multer.File> {
        if (!file) {
            throw new ValidationException({
                root: [
                    {
                        message: this.i18n.t("form.required"),
                        type: "error",
                    },
                ],
            });
        }

        // Проверка реального типа по magic bytes — не доверяем заголовку
        const { fileTypeFromBuffer } = await import("file-type");
        const detected = await fileTypeFromBuffer(file.buffer);

        if (
            !detected ||
            !BLOG_IMAGE_CONFIG.allowedMimeTypes.includes(
                detected.mime as AllowedImageMimeType,
            )
        ) {
            throw new ValidationException({
                root: [
                    {
                        message: this.i18n.t("form.file.unsupportedType"),
                        type: "error",
                    },
                ],
            });
        }

        // Подменяем mimetype на реальный — не тот что прислал клиент
        file.mimetype = detected.mime;

        // Проверка размера по конфигу сущности

        if (file.size > BLOG_IMAGE_CONFIG.maxFileSizeBytes) {
            throw new ValidationException({
                root: [
                    {
                        message: this.i18n.t("form.file.blogImage.tooLarge"),
                        type: "error",
                    },
                ],
            });
        }

        return file;
    }
}
