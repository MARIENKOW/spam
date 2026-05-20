/**
 * Парсит search params (URL или Next.js searchParams prop) в типизированные параметры.
 * Используется и на сервере (SSR prefetch) и внутри useUrlListState (клиент).
 * Одна функция — один источник правды для разбора URL.
 *
 * Все поля defaults (включая page) парсятся из URL по типу:
 *   number  → Number(value)
 *   boolean → value === "true"
 *   string  → value as-is
 */
export function parseListParams<P extends Record<string, unknown>>(
    searchParams: unknown,
    defaults: P,
): P {
    if (
        !searchParams ||
        typeof searchParams !== "object" ||
        Array.isArray(searchParams)
    ) {
        return { ...defaults };
    }

    const raw = searchParams as Record<string, unknown>;
    const result = { ...defaults };

    for (const k of Object.keys(defaults) as (keyof P & string)[]) {
        const cell = raw[k];
        const str = Array.isArray(cell) ? String(cell[0]) : typeof cell === "string" ? cell : undefined;
        if (str === undefined) continue;
        const def = defaults[k];
        if (typeof def === "number") {
            result[k] = Number(str) as P[typeof k];
        } else if (typeof def === "boolean") {
            result[k] = (str === "true") as P[typeof k];
        } else {
            result[k] = str as P[typeof k];
        }
    }

    return result;
}
