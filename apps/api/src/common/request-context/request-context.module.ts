// common/request-context/request-context.module.ts
import { Global, Module } from '@nestjs/common';
import { RequestContextService } from './request-context.service';
import { RequestContextMiddleware } from './request-context.middleware';

@Global() // ← обязательно
@Module({
    providers: [RequestContextService, RequestContextMiddleware],
    exports:   [RequestContextService],
})
export class RequestContextModule {}