import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import type { ApiErrorResponse } from "@myorg/shared/dto";
import { HTTP_STATUSES } from "@myorg/shared/http";

@Catch() // Ловит ВСЁ
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse<Response>();
        const req = ctx.getRequest<Request>();

        const status = this.extractStatus(exception);
        const errorResponse = this.formatError(exception, req, status);

        this.logger.error(
            `${req.method} ${req.url} - ${errorResponse.status} ${errorResponse.message}`,
            exception instanceof Error ? exception.stack : "",
        );

        res.status(status).json(errorResponse);
    }

    private extractStatus(exception: unknown): number {
        if (exception instanceof HttpException) return exception.getStatus();
        if (exception instanceof Error && "status" in (exception as any)) {
            return (
                Number((exception as any).status) ||
                HTTP_STATUSES.InternalServerError.status
            );
        }
        return HTTP_STATUSES.InternalServerError.status;
    }

    private formatError(
        exception: unknown,
        req: Request,
        status: number,
    ): ApiErrorResponse {
        let message = "Internal server error";
        let code = "INTERNAL_ERROR";
        let data: any;

        if (status >= 500) {
            message = "Internal server error";
            code = "INTERNAL_ERROR";
        } else if (exception instanceof HttpException) {
            const response = exception.getResponse();
            const exceptionResponse =
                typeof response === "string" ? response : (response as any);

            message =
                exceptionResponse.message ||
                exception.message ||
                "Server Error";
            code =
                exceptionResponse.code ||
                exceptionResponse.statusCode ||
                this.getStatusCode(status);
            data = exceptionResponse.data || exceptionResponse;
        }

        return {
            status,
            message,
            code,
            data,
            timestamp: new Date().toISOString(),
            path: req.url,
            context: "NEXT",
            errorType: "ApiErrorResponse",
        };
    }

    private getStatusCode(status: number): string {
        const entry = Object.values(HTTP_STATUSES).find(
            (s) => s.status === status,
        );
        return entry?.code || "SERVER ERROR";
    }
}
