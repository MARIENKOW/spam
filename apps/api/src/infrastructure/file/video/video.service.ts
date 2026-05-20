import {
    Injectable,
    Logger,
    NotFoundException,
    OnModuleInit,
} from "@nestjs/common";
import * as fs from "fs/promises";
import * as path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffprobeInstaller from "@ffprobe-installer/ffprobe";

import { VIDEO_MIME_TO_EXT, VIDEO_TRANSCODE_TIMEOUT_MS } from "./video.config";
import { VideoProcessingConfig } from "./video.types";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";
import { ImageService } from "@/infrastructure/file/img/image.service";
import { randomUUID as uuidv4 } from "crypto";
import { ImageDto, VideoDto } from "@myorg/shared/dto";
import { mapVideo } from "@/infrastructure/file/video/video.mapper";
import { FileEntityType } from "@/generated/prisma";
import { TMP_PATH } from "@/infrastructure/file/file.config";
import {
    moveFile,
    resolveFolder,
    cleanupFiles,
} from "@/infrastructure/file/file.utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VideoMeta {
    width: number;
    height: number;
    duration: number;
}

interface ProcessedFile {
    id: string;
    filename: string;
    mimeType: string;
    width: number;
    height: number;
    duration: number;
    size: number;
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class VideoService implements OnModuleInit {
    private readonly logger = new Logger(VideoService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly imageService: ImageService,
    ) {}

    private offsetPercent = 10;

    async onModuleInit(): Promise<void> {
        await fs.mkdir(TMP_PATH, { recursive: true });
        ffmpeg.setFfmpegPath(ffmpegInstaller.path);
        ffmpeg.setFfprobePath(ffprobeInstaller.path);
        this.logger.log(`ffmpeg  → ${ffmpegInstaller.path}`);
        this.logger.log(`ffprobe → ${ffprobeInstaller.path}`);
    }

    // ── Upload ────────────────────────────────────────────────────────────────

    async upload(
        file: Express.Multer.File,
        entityType: FileEntityType,
        options: VideoProcessingConfig,
    ): Promise<VideoDto> {
        const folder = resolveFolder(entityType);
        await fs.mkdir(folder, { recursive: true });

        // Шаг 1: обработка видео-файла на диск
        const processed = await this.processFile(file, folder, options);

        // Шаг 2: извлекаем кадр и сохраняем через ImageService
        let imageDto: ImageDto;
        try {
            imageDto = await this.generateImage(
                path.join(folder, processed.filename),
                processed.duration,
                entityType,
            );
        } catch (err) {
            await cleanupFiles(folder, [processed.filename], this.logger.warn.bind(this.logger));
            throw err;
        }

        // Шаг 3: единая запись в БД
        try {
            const video = await this.prisma.video.create({
                data: { ...processed, entityType, imageId: imageDto.id },
                include: { image: true },
            });
            // imageDto уже есть — лишний SELECT не нужен
            return mapVideo(video);
        } catch (err) {
            await cleanupFiles(folder, [processed.filename], this.logger.warn.bind(this.logger));
            await this.imageService
                .delete(imageDto.id)
                .catch((e) => this.logger.warn("Failed to rollback image", e));
            throw err;
        }
    }

    // ── Upload Many (atomic) ──────────────────────────────────────────────────

    async uploadMany(
        files: Express.Multer.File[],
        entityType: FileEntityType,
        options: VideoProcessingConfig,
    ): Promise<VideoDto[]> {
        if (files.length === 0) return [];

        const folder = resolveFolder(entityType);
        await fs.mkdir(folder, { recursive: true });

        // Шаг 1: обработка видео-файлов (sequential — транскодирование CPU-bound,
        // N параллельных ffmpeg-процессов перегрузят машину)
        const processed: ProcessedFile[] = [];
        for (const file of files) {
            try {
                processed.push(await this.processFile(file, folder, options));
            } catch (err) {
                await cleanupFiles(
                    folder,
                    processed.map((p) => p.filename),
                    this.logger.warn.bind(this.logger),
                );
                throw err;
            }
        }

        // Шаг 2: генерация кадров (sequential по той же причине)
        const imageDtos: ImageDto[] = [];
        for (const p of processed) {
            try {
                imageDtos.push(
                    await this.generateImage(
                        path.join(folder, p.filename),
                        p.duration,
                        entityType,
                    ),
                );
            } catch (err) {
                await cleanupFiles(
                    folder,
                    processed.map((p) => p.filename),
                    this.logger.warn.bind(this.logger),
                );
                await this.rollbackImages(imageDtos);
                throw err;
            }
        }

        // Шаг 3: единая транзакция — либо все, либо никто
        try {
            const videos = await this.prisma.$transaction(
                processed.map((p, i) =>
                    this.prisma.video.create({
                        data: { ...p, entityType, imageId: imageDtos[i].id },
                        include: { image: true },
                    }),
                ),
            );
            return videos.map((v) => mapVideo(v));
        } catch (err) {
            await cleanupFiles(
                folder,
                processed.map((p) => p.filename),
                this.logger.warn.bind(this.logger),
            );
            await this.rollbackImages(imageDtos);
            throw err;
        }
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    async delete(id: string): Promise<void> {
        const video = await this.prisma.video.findUnique({ where: { id } });
        if (!video) throw new NotFoundException("video.notFound");

        const folder = resolveFolder(video.entityType);

        // ПОРЯДОК ВАЖЕН: Video ссылается на Image через FK (imageId).
        // Нельзя удалить Image пока Video существует — получим FK violation.
        // 1. Удаляем Video-запись (снимает FK-ссылку на Image)
        // 2. Параллельно чистим файл на диске и Image-запись
        await this.prisma.video.delete({ where: { id } });

        await Promise.all([
            fs
                .unlink(path.join(folder, video.filename))
                .catch((e) =>
                    this.logger.warn(
                        `Failed to delete video file: ${video.filename}`,
                        e,
                    ),
                ),
            video.imageId
                ? this.imageService
                      .delete(video.imageId)
                      .catch((e) =>
                          this.logger.warn("Failed to delete image", e),
                      )
                : Promise.resolve(),
        ]);
    }

    // ── Move ──────────────────────────────────────────────────────────────────

    /**
     * Перемещает видео (и его превью) в папку нового entityType.
     *
     * Порядок:
     *   1. Переносим видео-файл на диск.
     *   2. Переносим превью через imageService.move (файл + БД image).
     *      При ошибке откатываем видео-файл.
     *   3. Обновляем entityType видео в БД.
     *      При ошибке откатываем оба файла и entityType image.
     */
    async move(id: string, newEntityType: FileEntityType): Promise<VideoDto> {
        const video = await this.prisma.video.findUnique({
            where: { id },
            include: { image: true },
        });
        if (!video) throw new NotFoundException("video.notFound");
        if (video.entityType === newEntityType) return mapVideo(video);

        const srcFolder = resolveFolder(video.entityType);
        const destFolder = resolveFolder(newEntityType);
        await fs.mkdir(destFolder, { recursive: true });

        const srcVideoPath = path.join(srcFolder, video.filename);
        const destVideoPath = path.join(destFolder, video.filename);

        // Шаг 1: переносим видео-файл
        await moveFile(srcVideoPath, destVideoPath);

        // Шаг 2: переносим превью через imageService (файл + БД image)
        if (video.image) {
            try {
                await this.imageService.move(video.image.id, newEntityType);
            } catch (err) {
                await moveFile(destVideoPath, srcVideoPath).catch((e) =>
                    this.logger.warn("Failed to rollback video file on move", e),
                );
                throw err;
            }
        }

        // Шаг 3: обновляем entityType видео в БД
        try {
            const updated = await this.prisma.video.update({
                where: { id },
                data: { entityType: newEntityType },
                include: { image: true },
            });
            return mapVideo(updated);
        } catch (err) {
            await Promise.all([
                moveFile(destVideoPath, srcVideoPath).catch((e) =>
                    this.logger.warn("Failed to rollback video file on move", e),
                ),
                video.image
                    ? this.imageService
                          .move(video.image.id, video.entityType)
                          .catch((e) =>
                              this.logger.warn(
                                  "Failed to rollback image on move",
                                  e,
                              ),
                          )
                    : Promise.resolve(),
            ]);
            throw err;
        }
    }

    // ── Find ──────────────────────────────────────────────────────────────────

    async findById(id: string): Promise<VideoDto> {
        const video = await this.prisma.video.findUnique({
            where: { id },
            include: { image: true },
        });
        if (!video) throw new NotFoundException("video.notFound");
        return mapVideo(video);
    }

    // ── Private ───────────────────────────────────────────────────────────────

    /**
     * Извлекает кадр на offsetPercent% от длительности и сохраняет через
     * ImageService как WebP. Размер = размер самого видео, ресайз не делается.
     */
    private async generateImage(
        videoPath: string,
        duration: number,
        entityType: FileEntityType,
    ): Promise<ImageDto> {
        // Зажимаем seek в безопасный диапазон [0, duration - 0.1].
        // Seek точно на duration вызывает "end of file" в ffmpeg.
        const seekSeconds = Math.min(
            Math.max((duration * this.offsetPercent) / 100, 0),
            Math.max(duration - 0.1, 0),
        );

        const frameBuffer = await this.extractFrame(videoPath, seekSeconds);

        // ImageService использует sharp(file.buffer) — для кадра видео это ok:
        // JPEG из ffmpeg мал и живёт в памяти только во время sharp-обработки.
        const fakeFile: Express.Multer.File = {
            fieldname: "image",
            originalname: "frame.jpg",
            encoding: "7bit",
            mimetype: "image/jpeg",
            buffer: frameBuffer,
            size: frameBuffer.length,
            destination: "",
            filename: "",
            path: "",
            stream: null as any,
        };

        // "webp" — только конвертация, без ресайза.
        // Sharp прочитает реальные размеры из JPEG-буфера сам.
        return this.imageService.upload(fakeFile, entityType, {
            mode: "webp",
            quality: 85,
        });
    }

    /**
     * Извлекает один кадр в Buffer через ffmpeg pipe — без temp-файлов.
     *
     * seekInput (-ss перед -i) = быстрый seek по ключевым кадрам.
     * Для thumbnail это оптимально: не декодируем всё видео до нужного момента.
     *
     * -pix_fmt yuvj420p: явно задаём JPEG-совместимый формат.
     * Без этого HDR / 10-bit / YUV422 видео падают на конвертации в JPEG,
     * т.к. JPEG поддерживает только 8-bit YUV420 (yuvj420p = full-range).
     *
     * Ошибки ffmpeg эмитируются на command, НЕ на stream.
     * Поэтому вешаем reject на оба объекта.
     */
    private extractFrame(
        videoPath: string,
        seekSeconds: number,
    ): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const chunks: Buffer[] = [];

            const command = ffmpeg(videoPath)
                .seekInput(seekSeconds)
                .frames(1)
                .format("image2")
                .outputOptions([
                    "-vcodec mjpeg",
                    "-pix_fmt yuvj420p", // HDR / 10-bit / YUV422 → JPEG-совместимый формат
                ]);

            const stream = command.pipe();

            command.on("error", reject); // ffmpeg-процесс: некорректный файл, seek-ошибки
            stream
                .on("data", (chunk: Buffer) => chunks.push(chunk))
                .on("end", () => resolve(Buffer.concat(chunks)))
                .on("error", reject); // stream I/O ошибки
        });
    }

    /**
     * Обрабатывает один файл и записывает результат в папку назначения.
     * Требует diskStorage: file.path указывает на temp-файл multer.
     * Не трогает БД — только файловая система.
     */
    private async processFile(
        file: Express.Multer.File,
        folder: string,
        options: VideoProcessingConfig,
    ): Promise<ProcessedFile> {
        // Ранний guard: memoryStorage не даёт file.path — ffmpeg упадёт с
        // непонятной ошибкой. Лучше явная ошибка здесь.
        if (!file.path) {
            throw new Error(
                "VideoService requires diskStorage. " +
                    "Configure multer with diskStorage({ destination: os.tmpdir() }).",
            );
        }

        const id = uuidv4();
        const ext =
            options.mode === "original"
                ? (VIDEO_MIME_TO_EXT[file.mimetype] ??
                  file.mimetype.split("/")[1] ??
                  "bin")
                : "mp4";
        const outputFilename = `${id}.${ext}`;
        const outputPath = path.join(folder, outputFilename);

        try {
            if (options.mode === "original") {
                // Атомарный перенос temp-файла: rename — O(1) без копирования данных.
                // EXDEV (разные FS/устройства) → fallback на copyFile + unlink.
                await moveFile(file.path, outputPath);
            } else {
                await this.transcodeToMp4(file.path, outputPath, options);
                // Temp-файл multer больше не нужен — чистим немедленно
                await fs.unlink(file.path).catch(() => undefined);
            }

            // Для original: размер уже известен из file.size (multer измерил при записи).
            // Для transcode: размер выходного файла заранее неизвестен — нужен stat.
            const [meta, size] = await Promise.all([
                this.getVideoMeta(outputPath),
                options.mode === "original"
                    ? Promise.resolve(file.size)
                    : fs.stat(outputPath).then((s) => s.size),
            ]);

            return {
                id,
                filename: outputFilename,
                mimeType:
                    options.mode === "original" ? file.mimetype : "video/mp4",
                ...meta,
                size,
            };
        } catch (err) {
            await Promise.all([
                fs
                    .unlink(outputPath)
                    .catch((e) =>
                        this.logger.warn(
                            `Failed to cleanup output after error: ${outputFilename}`,
                            e,
                        ),
                    ),
                // Чистим temp-файл multer: при ошибке транскодирования
                // он не удаляется в основном потоке
                fs.unlink(file.path).catch(() => undefined),
            ]);
            throw err;
        }
    }

    /**
     * Перекодирует в mp4 (H.264 + AAC).
     *
     * -movflags +faststart  — moov atom в начало: браузер воспроизводит
     *                         до полной загрузки (псевдо-стриминг).
     * -pix_fmt yuv420p      — максимальная совместимость браузеров/устройств.
     * -crf                  — переменный битрейт по качеству сцены.
     *                         Лучше фиксированного: адаптируется к сложности.
     * -map 0:v:0            — явно выбираем первый видеопоток.
     * -map 0:a:0?           — первый аудиопоток, если есть.
     *                         "?" делает его опциональным — видео без звука
     *                         (screen recordings, некоторые MP4) не падают.
     */
    private transcodeToMp4(
        input: string,
        output: string,
        opts: Extract<VideoProcessingConfig, { mode: "mp4" | "mp4-resize" }>,
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            let timedOut = false;

            const command = ffmpeg(input)
                .videoCodec("libx264")
                .audioCodec("aac")
                .outputOptions([
                    "-movflags +faststart",
                    "-pix_fmt yuv420p",
                    `-preset ${opts.preset ?? "fast"}`,
                    `-crf ${opts.crf ?? 23}`,
                    "-map 0:v:0",
                    "-map 0:a:0?",
                ]);

            if (opts.audioBitrate) command.audioBitrate(opts.audioBitrate);

            if (opts.mode === "mp4-resize") {
                command.videoFilters(
                    this.buildScaleFilter(
                        opts.width,
                        opts.height,
                        opts.fit ?? "crop",
                    ),
                );
            }

            const timer = setTimeout(() => {
                timedOut = true;
                command.kill("SIGKILL");
                reject(new Error("video.transcodeTimeout"));
            }, VIDEO_TRANSCODE_TIMEOUT_MS);

            command
                .output(output)
                .on("progress", ({ percent }) => {
                    if (percent != null) {
                        this.logger.debug(
                            `Transcoding ${path.basename(output)}: ${Math.round(percent)}%`,
                        );
                    }
                })
                .on("end", () => {
                    if (timedOut) return;
                    clearTimeout(timer);
                    resolve();
                })
                .on("error", (err) => {
                    if (timedOut) return;
                    clearTimeout(timer);
                    reject(err);
                })
                .run();
        });
    }

    /**
     * Строит vf-фильтр масштабирования для ffmpeg.
     *
     * H.264 (yuv420p) требует чётные размеры.
     * Math.floor(x/2)*2 гарантирует чётность — без этого ffmpeg падает
     * с "width/height not divisible by 2".
     *
     * pad: trunc((ow-iw)/2) и trunc((oh-ih)/2) — целочисленные отступы.
     * Без trunc при нечётной разнице ffmpeg выдаёт предупреждение и может
     * сдвинуть изображение на пиксель.
     */
    private buildScaleFilter(
        width: number,
        height: number,
        fit: "crop" | "pad" | "stretch",
    ): string {
        const w = Math.floor(width / 2) * 2;
        const h = Math.floor(height / 2) * 2;

        switch (fit) {
            case "crop":
                // Масштабируем вверх до нужного размера, обрезаем центр
                return (
                    `scale=${w}:${h}:force_original_aspect_ratio=increase,` +
                    `crop=${w}:${h}`
                );
            case "pad":
                // Вписываем в размер, добавляем чёрные полосы по центру
                return (
                    `scale=${w}:${h}:force_original_aspect_ratio=decrease,` +
                    `pad=${w}:${h}:trunc((ow-iw)/2):trunc((oh-ih)/2):black,` +
                    `setsar=1`
                );
            case "stretch":
                // Точный размер без сохранения пропорций
                return `scale=${w}:${h}`;
        }
    }

    /**
     * Читает метаданные видео через ffprobe.
     *
     * Нюансы:
     *
     * 1. duration: некоторые контейнеры (AVI без индекса, WebM) не хранят
     *    duration на уровне формата — ffprobe возвращает "N/A".
     *    parseFloat("N/A") = NaN. Фоллбэк: stream-level duration.
     *    Итоговый фоллбэк: 0.
     *
     * 2. Ротация мобильных видео: iPhone/Android пишут rotate-тег в метаданных
     *    потока (старый ffprobe: stream.tags.rotate) или в side_data_list
     *    (новый ffprobe: "Display Matrix").
     *    ffprobe возвращает сырые (некорректированные) width/height.
     *    Для видео с rotate=90/270 нужно поменять w и h местами,
     *    иначе сохраним неправильные размеры.
     *    Для транскодированных файлов ffmpeg автоматически применяет
     *    поворот и убирает тег — там getVideoMeta вернёт правильные размеры.
     *    Для original-mode — исправляем вручную здесь.
     */
    private getVideoMeta(filePath: string): Promise<VideoMeta> {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(filePath, (err, data) => {
                if (err) return reject(err);

                const videoStream = data.streams.find(
                    (s) => s.codec_type === "video",
                );

                // ── Duration ─────────────────────────────────────────────────
                const rawDuration = parseFloat(
                    String(
                        data.format.duration ?? videoStream?.duration ?? "0",
                    ),
                );
                const duration = isNaN(rawDuration) ? 0 : rawDuration;

                // ── Rotation ─────────────────────────────────────────────────
                // Старый ffprobe: stream.tags.rotate (строка, градусы)
                const tagRotation = parseInt(
                    videoStream?.tags?.rotate ?? "0",
                    10,
                );

                // Новый ffprobe (5+): side_data_list с "Display Matrix".
                // rotation там отрицательный (по часовой = отрицательный угол).
                const sideData: any[] =
                    (videoStream as any)?.side_data_list ?? [];
                const displayMatrix = sideData.find(
                    (s) => s.side_data_type === "Display Matrix",
                );
                const sideRotation = Math.abs(displayMatrix?.rotation ?? 0);

                const rotation = tagRotation || sideRotation;
                // 90° и 270° = портретное → ширина и высота меняются местами
                const isSwapped = rotation === 90 || rotation === 270;

                const rawWidth = videoStream?.width ?? 0;
                const rawHeight = videoStream?.height ?? 0;

                resolve({
                    width: isSwapped ? rawHeight : rawWidth,
                    height: isSwapped ? rawWidth : rawHeight,
                    duration,
                });
            });
        });
    }

    /**
     * Откатывает уже сохранённые Image-записи при ошибке в uploadMany.
     */
    private async rollbackImages(imageDtos: ImageDto[]): Promise<void> {
        await Promise.all(
            imageDtos.map((dto) =>
                this.imageService
                    .delete(dto.id)
                    .catch((e) =>
                        this.logger.warn("Failed to rollback image", e),
                    ),
            ),
        );
    }
}

