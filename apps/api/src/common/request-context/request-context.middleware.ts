// common/request-context/request-context.middleware.ts
import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { RequestContextService } from "./request-context.service";
import { env } from "@/config";

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
    constructor(private context: RequestContextService) {}

    use(req: Request, res: Response, next: NextFunction) {
        const origin = this.getOrigin(req);
        const ip = this.getIp(req);
        const userAgent = req.headers["user-agent"] ?? "unknown";

        this.context.run({ origin, ip, userAgent }, () => next());
    }

    private getOrigin(req: Request): string {
        // origin — есть только у браузерных cross-origin запросов
        // referer — есть у same-origin и некоторых редиректов
        // fallback — берём из конфига
        return (
            req.headers.origin ??
            (req.headers.referer
                ? new URL(req.headers.referer).origin // убираем path из referer
                : undefined) ??
            env.ALLOWED_ORIGIN[0]
        );
    }

    private getIp(req: Request): string {
        // За nginx: X-Forwarded-For: "реальный_ip, proxy1, proxy2"
        // Берём первый — он и есть клиент

        const forwarded = req.headers["x-forwarded-for"];

        if (forwarded) {
            return Array.isArray(forwarded)
                ? forwarded[0].split(",")[0].trim()
                : forwarded.split(",")[0].trim();
        }
        // X-Real-IP — nginx может слать именно этот заголовок
        const realIp = req.headers["x-real-ip"];
        if (realIp) {
            return Array.isArray(realIp) ? realIp[0] : realIp;
        }
        // Локально без прокси
        return req.socket.remoteAddress ?? "unknown";
    }
}
