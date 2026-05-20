export const VIDEO_MIME_TO_EXT: Record<string, string> = {
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",
    "video/x-msvideo": "avi",
    "video/x-matroska": "mkv",
};

/** Таймаут транскодирования на один файл. */
export const VIDEO_TRANSCODE_TIMEOUT_MS = 15 * 60 * 1_000; // 15 мин
