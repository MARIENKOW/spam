"use server";

import { headers } from "next/headers";

export async function getHeaderValue(value: string) {
    const headersStore = await headers();
    const resValue = headersStore.get(value) || null;
    return resValue;
}
