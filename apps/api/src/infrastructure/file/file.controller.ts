import * as path from "path";
import * as fs from "fs";
import * as mime from "mime-types";
import {
    Controller,
    Get,
    NotFoundException,
    Param,
    Query,
    Req,
    Res,
    UnauthorizedException,
} from "@nestjs/common";
import { Request, Response } from "express";
import {
    FILE_CONFIG,
    UPLOADS_BASE_PATH,
    UPLOADS_ROOT,
} from "@/infrastructure/file/file.config";
import { FileSignService } from "@/infrastructure/file/file-sign.service";
import { Public } from "@/modules/auth/decorators/public.decorator";

const { BLOG_VIDEO } = FILE_CONFIG;

@Controller(UPLOADS_ROOT)
export class FileController {
    constructor(private readonly fileSign: FileSignService) {}

    // @Get(`${BLOG_VIDEO.folder}/*filepath`)
    // @Public()
    // async serveFile(
    //     @Param("filepath") filepath: string | string[],
    //     @Query("sig") sig: string,
    //     @Query("exp") exp: string,
    //     @Req() req: Request,
    //     @Res() res: Response,
    // ): Promise<void> {
    //     // ── Ранняя проверка параметров ────────────────────────────────────────
    //     if (!sig || !exp)
    //         throw new UnauthorizedException("file.signatureInvalid");

    //     // ── Path traversal защита ─────────────────────────────────────────────
    //     const normalized = path
    //         .normalize(Array.isArray(filepath) ? filepath.join("/") : filepath)
    //         .replace(/^(\.\.[/\\])+/, "");

    //     const relativePath = `${BLOG_VIDEO.folder}/${normalized}`;
    //     const absolutePath = path.join(UPLOADS_BASE_PATH, relativePath);

    //     if (!absolutePath.startsWith(UPLOADS_BASE_PATH + path.sep)) {
    //         throw new NotFoundException("file.notFound");
    //     }

    //     // ── Проверка подписи ──────────────────────────────────────────────────
    //     try {
    //         this.fileSign.verify(relativePath, sig, exp);
    //     } catch {
    //         throw new UnauthorizedException("file.signatureInvalid");
    //     }

    //     // ── Stat файла ────────────────────────────────────────────────────────
    //     let stat: fs.Stats;
    //     try {
    //         stat = await fs.promises.stat(absolutePath);
    //     } catch {
    //         throw new NotFoundException("file.notFound");
    //     }

    //     if (!stat.isFile()) throw new NotFoundException("file.notFound");

    //     // ── Заголовки ─────────────────────────────────────────────────────────
    //     const mimeType =
    //         mime.lookup(absolutePath) || "application/octet-stream";
    //     const fileSize = stat.size;

    //     // ── Range (обязательно для видео) ─────────────────────────────────────
    //     const rangeHeader = req.headers["range"];

    //     if (rangeHeader) {
    //         const range = parseRange(fileSize, rangeHeader);

    //         if (range === "invalid") {
    //             res.status(416)
    //                 .setHeader("Content-Range", `bytes */${fileSize}`)
    //                 .end();
    //             return;
    //         }

    //         const { start, end } = range;

    //         res.status(206)
    //             .setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`)
    //             .setHeader("Content-Length", end - start + 1)
    //             .setHeader("Accept-Ranges", "bytes")
    //             .setHeader("Content-Type", mimeType)
    //             .setHeader("Cache-Control", "private, max-age=3600");

    //         pipeStream(fs.createReadStream(absolutePath, { start, end }), res);
    //         return;
    //     }

    //     // ── Полный файл ───────────────────────────────────────────────────────
    //     res.status(200)
    //         .setHeader("Content-Type", mimeType)
    //         .setHeader("Content-Length", fileSize)
    //         .setHeader("Accept-Ranges", "bytes")
    //         .setHeader("Cache-Control", "private, max-age=3600")
    //         .setHeader(
    //             "Content-Disposition",
    //             `inline; filename*=UTF-8''${encodeURIComponent(path.basename(absolutePath))}`,
    //         );

    //     pipeStream(fs.createReadStream(absolutePath), res);
    // }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pipeStream(stream: fs.ReadStream, res: Response): void {
    stream.on("error", (err: NodeJS.ErrnoException) => {
        if (!res.headersSent) {
            res.status(err.code === "ENOENT" ? 404 : 500).end();
        } else {
            res.destroy();
        }
        stream.destroy();
    });
    res.on("close", () => stream.destroy());
    stream.pipe(res);
}

function parseRange(
    fileSize: number,
    rangeHeader: string,
): { start: number; end: number } | "invalid" {
    const match = rangeHeader.match(/^bytes=(\d*)-(\d*)$/);
    if (!match) return "invalid";

    const start = match[1]
        ? parseInt(match[1], 10)
        : fileSize - parseInt(match[2], 10);
    const end = match[2] ? parseInt(match[2], 10) : fileSize - 1;

    if (
        isNaN(start) ||
        isNaN(end) ||
        start > end ||
        start < 0 ||
        end >= fileSize
    ) {
        return "invalid";
    }

    return { start, end };
}
