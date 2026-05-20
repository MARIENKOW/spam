export function toFormData(
    obj: Record<string, string | number | File | Blob | Date | string[]>,
): FormData {
    const formData = new FormData();
    for (const [key, value] of Object.entries(obj)) {
        if (Array.isArray(value)) {
            value.forEach((item) => formData.append(`${key}[]`, item));
        } else if (value instanceof Date) {
            formData.append(key, value.toISOString());
        } else if (typeof value === "number") {
            formData.append(key, String(value));
        } else {
            formData.append(key, value);
        }
    }
    return formData;
}
