import * as crypto from "crypto";
import { env } from "@/config";

const TTL_MS = 3 * 60 * 60 * 1_000; // 3 часа

export function signPath(relativePath: string, ttlMs = TTL_MS): string {
    const exp = Date.now() + ttlMs;
    const sig = buildSig(relativePath, exp);
    return `${relativePath}?sig=${sig}&exp=${exp}`;
}

export function verifyPath(
    relativePath: string,
    sig: string,
    exp: string,
): void {
    const expMs = Number(exp);
    if (isNaN(expMs) || Date.now() > expMs)
        throw new Error("file.signatureExpired");

    const expected = buildSig(relativePath, expMs);
    const expectedBuf = Buffer.from(expected);
    const actualBuf = Buffer.from(sig);

    if (
        expectedBuf.length !== actualBuf.length ||
        !crypto.timingSafeEqual(expectedBuf, actualBuf)
    ) {
        throw new Error("file.signatureInvalid");
    }
}

function buildSig(relativePath: string, exp: number): string {
    return crypto
        .createHmac("sha256", env.FILE_SECRET)
        .update(`${relativePath}:${exp}`)
        .digest("hex");
}

export function signUploadToken(actorId: string, ttlMs = 60_000): string {
    const exp = Date.now() + ttlMs;
    const sig = buildSig(`upload:${actorId}`, exp);
    return `${actorId}:${exp}:${sig}`;
}

export function verifyUploadToken(token: string): string {
    if (!token) throw new Error("upload.tokenMissing");

    const parts = token.split(":");
    const sig = parts[parts.length - 1];
    const exp = parts[parts.length - 2];
    const actorId = parts.slice(0, -2).join(":");

    if (!actorId || !exp || !sig) throw new Error("upload.tokenInvalid");

    const expMs = Number(exp);
    if (isNaN(expMs) || Date.now() > expMs)
        throw new Error("upload.tokenExpired");

    const expected = buildSig(`upload:${actorId}`, expMs);
    const expectedBuf = Buffer.from(expected);
    const actualBuf = Buffer.from(sig);

    if (
        expectedBuf.length !== actualBuf.length ||
        !crypto.timingSafeEqual(expectedBuf, actualBuf)
    ) {
        throw new Error("upload.tokenInvalid");
    }

    return actorId;
}
