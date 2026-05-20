import { PipeTransform, Injectable } from "@nestjs/common";
import * as fs from "fs/promises";
import {
    ALLOWED_VIDEO_MIME_TYPES,
    BLOG_VIDEO_CONFIG,
} from "@myorg/shared/form";
import { ValidationException } from "@/common/exception/validation.exception";
import { I18nService } from "nestjs-i18n";
import { MessageStructure } from "@myorg/shared/i18n";

type AllowedVideoMimeType = (typeof ALLOWED_VIDEO_MIME_TYPES)[number];
type BlogVideoInput = { video: Express.Multer.File };

// Максимум байт, необходимых file-type для определения типа видео
const MAGIC_BYTES_SIZE = 4_100;

@Injectable()
export class BlogVideoValidationPipe implements PipeTransform {
    constructor(private i18n: I18nService<MessageStructure>) {}
    async transform(
        file: Express.Multer.File | undefined,
    ): Promise<Express.Multer.File> {
        if (!file) {
            throw new ValidationException<BlogVideoInput>({
                root: [
                    { message: this.i18n.t("form.required"), type: "error" },
                ],
            });
        }

        // Читаем только первые MAGIC_BYTES_SIZE байт для определения реального типа.
        // Если file-type не смог определить формат (например, MP4 с moov-атомом в конце) —
        // используем mimetype от клиента как fallback.
        let detectedMime: string | undefined;
        try {
            const handle = await fs.open(file.path, "r");
            try {
                const buf = Buffer.alloc(MAGIC_BYTES_SIZE);
                const { bytesRead } = await handle.read(
                    buf,
                    0,
                    MAGIC_BYTES_SIZE,
                    0,
                );
                const { fileTypeFromBuffer } = await import("file-type");
                const result = await fileTypeFromBuffer(buf.subarray(0, bytesRead));
                detectedMime = result?.mime;
            } finally {
                await handle.close();
            }
        } catch {
            await fs.unlink(file.path).catch(() => undefined);
            throw new ValidationException<BlogVideoInput>({
                root: [
                    {
                        message: this.i18n.t("form.file.unreadable"),
                        type: "error",
                    },
                ],
            });
        }

        const effectiveMime = detectedMime ?? file.mimetype;

        if (
            !ALLOWED_VIDEO_MIME_TYPES.includes(
                effectiveMime as AllowedVideoMimeType,
            )
        ) {
            await fs.unlink(file.path).catch(() => undefined);
            throw new ValidationException<BlogVideoInput>({
                root: [
                    {
                        message: this.i18n.t("form.file.unsupportedType"),
                        type: "error",
                    },
                ],
            });
        }

        file.mimetype = effectiveMime;

        if (file.size > BLOG_VIDEO_CONFIG.maxFileSizeBytes) {
            await fs.unlink(file.path).catch(() => undefined);
            throw new ValidationException<BlogVideoInput>({
                root: [
                    {
                        message: this.i18n.t("form.file.blogVideo.tooLarge"),
                        type: "error",
                    },
                ],
            });
        }

        return file;
    }
}
