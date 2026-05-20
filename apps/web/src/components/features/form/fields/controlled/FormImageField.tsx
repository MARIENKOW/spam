"use client";

import { useState } from "react";
import {
    Controller,
    FieldValues,
    Path,
    useFormContext,
    useWatch,
} from "react-hook-form";
import { ZodType } from "zod";
import { useImagePreview } from "@/hooks/useImagePreview";
import ImagePreview, { ImagePreviewProps } from "@/components/common/ImagePreview";
import {
    DropZone,
    DropZoneProps,
} from "@/components/features/form/fields/uncontrolled/DropZone";
import { StyledFormControl } from "@/components/ui/StyledFormControl";
import { StyledFormHelperText } from "@/components/ui/StyledFormHelperText";
import { MessageKeyType } from "@myorg/shared/i18n";
import { useTranslations } from "next-intl";

type FormImageFieldProps<T extends FieldValues> = {
    name: Path<T>;
    schema: ZodType;
    helperText?: string;
    previewProps?: Omit<ImagePreviewProps, "src" | "onDelete">;
} & Omit<DropZoneProps, "error" | "onFiles" | "multiple">;

export default function FormImageField<T extends FieldValues>({
    name,
    schema,
    helperText,
    previewProps,
    ...dropZoneProps
}: FormImageFieldProps<T>) {
    const t = useTranslations();
    const { control, getValues } = useFormContext<T>();

    const [defaultPreview] = useState<string | null>(() => {
        const initial = getValues(name);
        return typeof initial === "string" ? initial : null;
    });

    const watchedValue = useWatch({ name, control });
    const preview = useImagePreview({
        value: watchedValue,
        schema,
        defaultValue: defaultPreview,
    });

    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange }, fieldState: { error } }) => (
                <StyledFormControl
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                    }}
                    error={!!error?.message}
                >
                    {preview ? (
                        <ImagePreview
                            src={preview}
                            onDelete={() => onChange(null)}
                            {...previewProps}
                        />
                    ) : (
                        <DropZone
                            multiple={false}
                            onFiles={(files) => onChange(files[0])}
                            error={!!error?.message}
                            {...dropZoneProps}
                        />
                    )}
                    <StyledFormHelperText>
                        {error?.message
                            ? t(error.message as MessageKeyType)
                            : helperText}
                    </StyledFormHelperText>
                </StyledFormControl>
            )}
        />
    );
}
