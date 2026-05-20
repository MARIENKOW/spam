import * as fs from "fs/promises";
import * as path from "path";
import { FileEntityType } from "@/generated/prisma";
import { env } from "@/config";
import { FILE_CONFIG, UPLOADS_ROOT } from "@/infrastructure/file/file.config";
import { signPath } from "@/infrastructure/file/file-sign.utils";

/**
 * Атомарный перенос файла.
 * rename() — O(1): переименование inode, данные не копируются.
 * EXDEV (temp и dest на разных устройствах / разных FS) → fallback:
 * copyFile + unlink. Стоимость = полная копия файла, но это редкий случай.
 */
export async function moveFile(src: string, dest: string): Promise<void> {
    try {
        await fs.rename(src, dest);
    } catch (err: any) {
        if (err.code !== "EXDEV") throw err;
        await fs.copyFile(src, dest);
        await fs.unlink(src).catch(() => undefined);
    }
}

/**
 * Возвращает абсолютный путь к папке хранения файлов для данного entityType.
 */
export function resolveFolder(entityType: FileEntityType): string {
    const config = FILE_CONFIG[entityType];
    return path.resolve(process.cwd(), UPLOADS_ROOT, config.folder);
}

/**
 * Удаляет список файлов параллельно.
 * Ошибки не пробрасывает — вызывает onWarn для каждой.
 */
export async function cleanupFiles(
    folder: string,
    filenames: string[],
    onWarn: (msg: string, err: unknown) => void = () => {},
): Promise<void> {
    await Promise.all(
        filenames.map((filename) =>
            fs
                .unlink(path.join(folder, filename))
                .catch((e) =>
                    onWarn(`Failed to cleanup file: ${filename}`, e),
                ),
        ),
    );
}

/**
 * Строит публичный URL для файла.
 * Для приватных файлов — подписывает путь (HMAC + exp).
 * Вычисляется один раз в маппере — не хранится в БД.
 */
export function buildFileUrl(
    entityType: FileEntityType,
    filename: string,
): string {
    const config = FILE_CONFIG[entityType];
    const base = env.NEXT_PUBLIC_API_ORIGIN_CLIENT.replace(/\/$/, "");
    const prefix = env.NEXT_PUBLIC_API_GLOBAL_PREFIX.replace(/^\//, "");
    const relative = `${config.folder}/${filename}`;
    return `${base}/${prefix}/${UPLOADS_ROOT}/${
        config.private ? signPath(relative) : relative
    }`;
}
