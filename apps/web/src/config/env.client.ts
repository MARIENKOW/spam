import { clientEnvSchema } from "@myorg/shared/env";

// Этот файл можно импортировать ТОЛЬКО в:
//   - Server Components
//   - Route Handlers (app/api/...)
//   - Server Actions
//   - next.config.ts
//   - middleware.ts
//
// НЕ импортировать в клиентские компоненты ('use client')

const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_API_GLOBAL_PREFIX: process.env.NEXT_PUBLIC_API_GLOBAL_PREFIX,
    NEXT_PUBLIC_API_ORIGIN_CLIENT: process.env.NEXT_PUBLIC_API_ORIGIN_CLIENT,
});

if (!parsed.success) {
    console.error("\n❌ Ошибка валидации серверных переменных окружения:\n");
    console.error(parsed.error);
    throw new Error("Invalid client environment variables");
}
export const clientEnv = parsed.data;
