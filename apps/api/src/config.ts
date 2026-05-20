import { serverEnvSchema, clientEnvSchema } from "@myorg/shared/env";
import { config } from "dotenv";
import path = require("path");

config({ path: path.resolve(process.cwd(), "../../.env") });

const parsedServer = serverEnvSchema.safeParse(process.env);
const parsedCLient = clientEnvSchema.safeParse(process.env);

if (!parsedServer.success) {
    console.error("\n❌ Ошибка валидации переменных окружения:\n");
    console.log(parsedServer.error);
    process.exit(1);
}
if (!parsedCLient.success) {
    console.error("\n❌ Ошибка валидации переменных окружения:\n");
    console.log(parsedServer.error);
    process.exit(1);
}

export const env = { ...parsedCLient.data, ...parsedServer.data };
