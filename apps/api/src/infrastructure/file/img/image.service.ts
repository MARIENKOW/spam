import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import sharp from "sharp";
import * as fs from "fs/promises";
import * as path from "path";

import { PrismaService } from "@/infrastructure/prisma/prisma.service";
import { randomUUID as uuidv4 } from "crypto";
import { ImageDto } from "@myorg/shared/dto";
import { mapImage } from "@/infrastructure/file/img/image.mapper";
import { FileEntityType } from "@/generated/prisma";
import { ImageProcessingConfig } from "@/infrastructure/file/img/image.types";
import { MIME_TO_EXT } from "@/infrastructure/file/img/image.config";
import {
    moveFile,
    resolveFolder,
    cleanupFiles,
} from "@/infrastructure/file/file.utils";

interface ProcessedFile {
    id: string;
    filename: string;
    mimeType: string;
    width: number;
    height: number;
    size: number;
}

@Injectable()
export class ImageService {
    private readonly logger = new Logger(ImageService.name);

    constructor(private readonly prisma: PrismaService) {}

    // ── Upload ────────────────────────────────────────────────────────────────

    async upload(
        file: Express.Multer.File,
        entityType: FileEntityType,
        options: ImageProcessingConfig,
    ): Promise<ImageDto> {
        const folder = resolveFolder(entityType);
        await fs.mkdir(folder, { recursive: true });

        // Stage 1: write file to disk
        const processed = await this.processFile(file, folder, options);

        // Stage 2: persist to DB, rollback file on failure
        try {
            const image = await this.prisma.image.create({
                data: { ...processed, entityType },
            });
            return mapImage(image);
        } catch (err) {
            await cleanupFiles(
                folder,
                [processed.filename],
                this.logger.warn.bind(this.logger),
            );
            throw err;
        }
    }

    // ── Upload Many (atomic) ──────────────────────────────────────────────────

    async uploadMany(
        files: Express.Multer.File[],
        entityType: FileEntityType,
        options: ImageProcessingConfig,
    ): Promise<ImageDto[]> {
        const folder = resolveFolder(entityType);
        await fs.mkdir(folder, { recursive: true });

        const processed: ProcessedFile[] = [];

        // Stage 1: write all files to disk sequentially
        // Sequential (not Promise.all) — чтобы при ошибке точно знать что откатывать
        for (const file of files) {
            try {
                const result = await this.processFile(file, folder, options);
                processed.push(result);
            } catch (err) {
                await cleanupFiles(
                    folder,
                    processed.map((p) => p.filename),
                    this.logger.warn.bind(this.logger),
                );
                throw err;
            }
        }

        // Stage 2: single DB transaction — либо все, либо никто
        try {
            const images = await this.prisma.$transaction(
                processed.map((p) =>
                    this.prisma.image.create({
                        data: { ...p, entityType },
                    }),
                ),
            );
            return images.map((img) => mapImage(img));
        } catch (err) {
            await cleanupFiles(
                folder,
                processed.map((p) => p.filename),
                this.logger.warn.bind(this.logger),
            );
            throw err;
        }
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    async delete(id: string): Promise<void> {
        const image = await this.prisma.image.findUnique({ where: { id } });
        if (!image) throw new NotFoundException("image.notFound");

        const folder = resolveFolder(image.entityType);

        // БД удаляем первой: если упадёт — файл цел, запись не осталась.
        // Файл удаляем после: ошибка здесь не критична — только логируем.
        await this.prisma.image.delete({ where: { id } });
        await fs
            .unlink(path.join(folder, image.filename))
            .catch((e) =>
                this.logger.warn(
                    `Failed to delete image file: ${image.filename}`,
                    e,
                ),
            );
    }

    // ── Move ──────────────────────────────────────────────────────────────────

    /**
     * Перемещает файл картинки в папку нового entityType и обновляет БД.
     * Файл переносится первым: fs.rename атомарен и легко обратим.
     * При ошибке обновления БД файл откатывается на место.
     */
    async move(id: string, newEntityType: FileEntityType): Promise<ImageDto> {
        const image = await this.prisma.image.findUnique({ where: { id } });
        if (!image) throw new NotFoundException("image.notFound");
        if (image.entityType === newEntityType) return mapImage(image);

        const srcPath = path.join(
            resolveFolder(image.entityType),
            image.filename,
        );
        const destFolder = resolveFolder(newEntityType);
        await fs.mkdir(destFolder, { recursive: true });
        const destPath = path.join(destFolder, image.filename);

        await moveFile(srcPath, destPath);

        try {
            const updated = await this.prisma.image.update({
                where: { id },
                data: { entityType: newEntityType },
            });
            return mapImage(updated);
        } catch (err) {
            await moveFile(destPath, srcPath).catch((e) =>
                this.logger.warn("Failed to rollback image file on move", e),
            );
            throw err;
        }
    }

    // ── Find ──────────────────────────────────────────────────────────────────

    async findById(id: string): Promise<ImageDto> {
        const image = await this.prisma.image.findUnique({ where: { id } });
        if (!image) throw new NotFoundException("image.notFound");
        return mapImage(image);
    }

    // ── Private ───────────────────────────────────────────────────────────────

    /**
     * Обрабатывает один файл (конвертация / ресайз) и записывает его на диск.
     * Не трогает БД — только файловая система.
     */
    private async processFile(
        file: Express.Multer.File,
        folder: string,
        options: ImageProcessingConfig,
    ): Promise<ProcessedFile> {
        const id = uuidv4();
        let filename: string | undefined;

        try {
            if (options.mode === "original") {
                const ext =
                    MIME_TO_EXT[file.mimetype] ??
                    file.mimetype.split("/")[1] ??
                    "bin";
                filename = `${id}.${ext}`;
                await fs.writeFile(path.join(folder, filename), file.buffer);
                let width = 0;
                let height = 0;
                try {
                    const meta = await sharp(file.buffer).metadata();
                    width = meta.width ?? 0;
                    height = meta.height ?? 0;
                } catch {
                    // Sharp не поддерживает некоторые форматы (ICO, JP2, JXL).
                    // Файл уже сохранён как есть — размеры просто остаются нулями.
                }
                return {
                    id,
                    filename,
                    mimeType: file.mimetype,
                    width,
                    height,
                    size: file.size,
                };
            } else if (options.mode === "webp") {
                filename = `${id}.webp`;
                const result = await sharp(file.buffer)
                    .webp({ quality: options.quality ?? 85 })
                    .toFile(path.join(folder, filename));
                return {
                    id,
                    filename,
                    mimeType: "image/webp",
                    width: result.width,
                    height: result.height,
                    size: result.size,
                };
            } else {
                // webp-resize
                filename = `${id}.webp`;
                const result = await sharp(file.buffer)
                    .resize(options.width, options.height, {
                        fit: options.fit ?? "cover",
                    })
                    .webp({ quality: options.quality ?? 85 })
                    .toFile(path.join(folder, filename));
                return {
                    id,
                    filename,
                    mimeType: "image/webp",
                    width: result.width,
                    height: result.height,
                    size: result.size,
                };
            }
        } catch (err) {
            if (filename) {
                await fs
                    .unlink(path.join(folder, filename))
                    .catch((e) =>
                        this.logger.warn(
                            `Failed to cleanup file after processing error: ${filename}`,
                            e,
                        ),
                    );
            }
            throw err;
        }
    }
}
