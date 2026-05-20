"use server";

import { AvailableLanguage } from "@myorg/shared/i18n";
import { cookies } from "next/headers";

export async function getCookieValue(value: string) {
    const cookieStore = await cookies();
    const resValue = cookieStore.get(value)?.value || null;
    return resValue;
}
export async function setCookieLocale(value: AvailableLanguage) {
    const cookieStore = await cookies();
    const resValue = cookieStore.set("NEXT_LOCALE", value, { path: "/" });
    return resValue;
}
export async function getAllCookieToClient() {
    const cookieStore = await cookies();
    const resValue = cookieStore
        .getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join("; ");

    return resValue;
}

