import { ALLOWED_IMAGE_MIME_TYPES } from "@myorg/shared/form";

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

// Расширение файла по mimetype — для сохранения оригинала
export const MIME_TO_EXT: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg",
    "application/xml": "svg",
    "text/xml": "svg",
    "image/x-icon": "ico",
    "image/vnd.microsoft.icon": "ico",
    "image/avif": "avif",
    "image/jxl": "jxl",
    "image/heic": "heic",
    "image/heif": "heif",
    "image/tiff": "tiff",
    "image/bmp": "bmp",
    "image/jp2": "jp2",
};
