import { z } from "zod";
import { Email, Password } from "../form/fields";

const boolStr = z.enum(["true", "false"]).transform((v) => v === "true");
const csvString = z.string().transform((v) =>
    v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
);

/** Только серверные — НИКОГДА не импортировать в клиентские компоненты */
export const serverEnvSchema = z
    .object({
        NODE_ENV: z.enum(["development", "production", "test"]),

        // Database
        DB_HOST: z.string().min(1),
        DB_USER: z.string().min(1),
        DB_DATABASE: z.string().min(1),
        DB_PASSWORD: z.string().default(""),
        DB_PORT: z.coerce.number().int().positive(),
        DB_CONNECT_TIMEOUT: z.coerce.number().int().positive(),
        DB_PROVIDER: z
            .enum(["postgresql", "mysql", "sqlite"])
            .default("postgresql"),

        // SMTP
        SMTP_HOST: z.string().min(1),
        SMTP_PORT: z.coerce.number().int().positive(),
        SMTP_USER: z.string().email(),
        SMTP_PASSWORD: z.string().min(1),

        // JWT
        JWT_ACCESS_SECRET: z.string().min(16),
        JWT_REFRESH_SECRET: z.string().min(16),
        JWT_SECRET: z.string().min(16),

        // Telegram
        TELEGRAM_BOT_TOKEN: z
            .string()
            .regex(/^\d+:[A-Za-z0-9_-]+$/, "Невалидный BOT_TOKEN"),
        TELEGRAM_CHAT_ID: z.string().min(1),

        // Google OAuth
        GOOGLE_CLIENT_ID: z.string().min(1),
        GOOGLE_CLIENT_SECRET: z.string().min(1),
        
        FILE_SECRET: z.string().min(1),

        SUPERADMIN_EMAIL: Email.or(z.literal("")),
        SUPERADMIN_PASSWORD: Password.or(z.literal("")),

        // Misc
        HTTPS: boolStr.default(false),
        ALLOWED_ORIGIN: csvString,
        SERVER_PORT: z.coerce.number().int().positive(),
        API_ORIGIN_SERVER: z.string(),
    })
    .transform((data) => ({
        ...data,
        DB_URL: `${data.DB_PROVIDER}://${data.DB_USER}:${data.DB_PASSWORD}@${data.DB_HOST}:${data.DB_PORT}/${data.DB_DATABASE}`,
    }));

/** Только NEXT_PUBLIC_ — безопасно импортировать где угодно, в том числе на клиенте */
export const clientEnvSchema = z.object({
    NEXT_PUBLIC_API_GLOBAL_PREFIX: z.string(),
    NEXT_PUBLIC_API_ORIGIN_CLIENT: z.string(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;
