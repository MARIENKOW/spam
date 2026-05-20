import { serverEnvSchema } from "@myorg/shared/env";


// Этот файл можно импортировать ТОЛЬКО в:
//   - Server Components
//   - Route Handlers (app/api/...)
//   - Server Actions
//   - next.config.ts
//   - middleware.ts
//
// НЕ импортировать в клиентские компоненты ('use client')

const parsed = serverEnvSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("\n❌ Ошибка валидации серверных переменных окружения:\n");
    console.error(parsed.error);
    throw new Error("Invalid server environment variables");
}

export const serverEnv = parsed.data;
