import { useEffect, useState } from "react";
import { ZodType } from "zod";

export function useImagePreview({
    value,
    schema,
    defaultValue,
}: {
    value: File | string | null | undefined;
    schema: ZodType;
    defaultValue: string | null;
}) {
    const [preview, setPreview] = useState<string | null>(defaultValue);

    useEffect(() => {
        if (!value) return setPreview(null);
        if (typeof value === "string") return setPreview(value);
        const isSuccess = schema.safeParse(value).success;
        if (!isSuccess) return setPreview(null);
        const url = URL.createObjectURL(value as File);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [value]);

    return preview;
}
