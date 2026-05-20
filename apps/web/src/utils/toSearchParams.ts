export function toSearchParams(
    obj: Record<string, string | number | boolean | Date | string[] | number[] | undefined | null>,
): URLSearchParams {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(obj)) {
        if (value === undefined || value === null) continue;
        if (Array.isArray(value)) {
            value.forEach((item) => search.append(key, String(item)));
        } else if (value instanceof Date) {
            search.append(key, value.toISOString());
        } else {
            search.append(key, String(value));
        }
    }
    return search;
}
