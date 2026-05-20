import { GlobalExceptionFilter } from "@/common/filters/global.exception.filter";
import { env } from "@/config";
import { AppModule } from "@/modules/app/app.module";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix(env.NEXT_PUBLIC_API_GLOBAL_PREFIX);
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.use(cookieParser());
    app.enableCors({
        origin: env.ALLOWED_ORIGIN,
        // methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true, // cookies/auth
        // allowedHeaders: 'Content-Type, Authorization, X-Requested-With',
        // exposedHeaders: 'X-Total-Count', // кастомные
        // maxAge: 3600, // preflight кэш
    });
    await app
        .listen(env.SERVER_PORT)
        .catch((err) => console.log("nest error: ", err))
        .then((data) => {
            console.log("server is working on port: ", data.address().port);
        });
}

bootstrap();
