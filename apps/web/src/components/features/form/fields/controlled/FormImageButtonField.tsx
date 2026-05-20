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
    UploadButton,
    UploadButtonProps,
} from "@/components/features/form/fields/uncontrolled/UploadButton";
import { StyledFormControl } from "@/components/ui/StyledFormControl";
import { StyledFormHelperText } from "@/components/ui/StyledFormHelperText";
import { MessageKeyType } from "@myorg/shared/i18n";
import { useTranslations } from "next-intl";

type FormImageButtonFieldProps<T extends FieldValues> = {
    name: Path<T>;
    schema: ZodType;
    helperText?: string;
    previewProps?: Omit<ImagePreviewProps, "src" | "onDelete">;
} & Omit<UploadButtonProps, "error" | "onFiles">;

export default function FormImageButtonField<T extends FieldValues>({
    name,
    schema,
    helperText,
    previewProps,
    ...uploadButtonProps
}: FormImageButtonFieldProps<T>) {
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
                    sx={{ display: "flex", flexDirection: "column", flex: 1 }}
                    error={!!error?.message}
                >
                    {preview ? (
                        <ImagePreview
                            src={preview}
                            onDelete={() => onChange(null)}
                            {...previewProps}
                        />
                    ) : (
                        <UploadButton
                            onFiles={(files) => onChange(files[0] ?? null)}
                            error={!!error?.message}
                            {...uploadButtonProps}
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
