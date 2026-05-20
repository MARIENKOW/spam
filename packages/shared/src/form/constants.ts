import { ImageValidationConfig, VideoValidationConfig } from "./types";

export const PASSWORD_MIN_LENGTH = 5;
export const PASSWORD_MAX_LENGTH = 30;
export const EMAIL_MAX_LENGTH = 50;
export const CHANGE_PASSWORD_OTP_LENGTH = 5;
export const BLOG_BODY_MIN_LENGTH = 500;
export const BLOG_BODY_MAX_LENGTH = 10000;
export const BLOG_TITLE_MIN_LENGTH = 5;
export const BLOG_TITLE_MAX_LENGTH = 75;
export const BLOG_SUBTITLE_MIN_LENGTH = 5;
export const BLOG_SUBTITLE_MAX_LENGTH = 75;
export const INVITATION_NOTE_MAX_LENGTH = 100;
export const ALLOWED_IMAGE_MIME_TYPES = [
    // Основные
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",

    "application/xml", // SVG на Windows
    "text/xml", // SVG в некоторых браузерах

    // Иконки / favicon
    "image/x-icon", // .ico — нестандартный, но широко используется
    "image/vnd.microsoft.icon", // .ico — официальный MIME

    // Современные форматы
    "image/avif",
    "image/jxl", // JPEG XL
    "image/heic",
    "image/heif", // file-type возвращает именно это для HEIC

    // Расширенная совместимость
    "image/tiff",
    "image/bmp",
    "image/jp2",
];
export const AVATAR_CONFIG: ImageValidationConfig = {
    maxFileSizeBytes: 50 * 1024 * 1024, // 50MB
    allowedMimeTypes: ALLOWED_IMAGE_MIME_TYPES,
};
export const BLOG_IMAGE_CONFIG: ImageValidationConfig = {
    maxFileSizeBytes: 50 * 1024 * 1024, // 50MB
    allowedMimeTypes: ALLOWED_IMAGE_MIME_TYPES,
};

export const ALLOWED_VIDEO_MIME_TYPES = [
    // Основные
    "video/mp4",
    "video/webm",
    "video/ogg",

    // Apple
    "video/quicktime", // .mov

    // Современные контейнеры
    "video/x-matroska", // .mkv
    "video/x-m4v", // .m4v

    // Legacy (если нужна обратная совместимость)
    "video/x-msvideo", // .avi
    "video/x-ms-wmv", // .wmv
    "video/x-flv", // .flv
    "video/mpeg", // .mpeg
    "video/3gpp", // .3gp (мобильные)
    "video/3gpp2", // .3g2
];
export const BLOG_VIDEO_CONFIG: VideoValidationConfig = {
    maxFileSizeBytes: 500 * 1024 * 1024, // 500MB
    allowedMimeTypes: ALLOWED_VIDEO_MIME_TYPES,
};
