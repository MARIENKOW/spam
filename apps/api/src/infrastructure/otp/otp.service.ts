import { Injectable } from "@nestjs/common";
import * as crypto from "crypto";

@Injectable()
export class OtpService {
    constructor() {
        // Секрет для HMAC — обязательно в env, не хардкодим
    }

    /** Генерирует числовой OTP код заданной длины */
    generate({ length }: { length: number }): string {
        const max = Math.pow(10, length);
        // crypto.randomInt — криптографически безопасный CSPRNG
        const code = crypto.randomInt(0, max);
        return code.toString().padStart(length, "0");
    }
}
