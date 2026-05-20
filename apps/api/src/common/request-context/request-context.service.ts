import { Injectable } from "@nestjs/common";
import { AsyncLocalStorage } from "async_hooks";

interface RequestContext {
    origin: string;
    userAgent?: string;
    ip?: string;
}

@Injectable()
export class RequestContextService {
    private storage = new AsyncLocalStorage<RequestContext>();

    run(context: RequestContext, callback: () => void) {
        this.storage.run(context, callback);
    }

    private get store(): RequestContext | undefined {
        return this.storage.getStore();
    }

    get origin(): string | undefined {
        return this.store?.origin;
    }

    get ip(): string | undefined {
        return this.store?.ip;
    }

    get userAgent(): string | undefined {
        return this.store?.userAgent;
    }

    // Полный контекст если нужен сразу весь
    get context(): RequestContext | undefined {
        return this.store;
    }
}
