"use client";

import { useEffect } from "react";
import {
    DropZone,
    DropZoneProps,
} from "@/components/features/form/fields/uncontrolled/DropZone";
import { StyledFormHelperText } from "@/components/ui/StyledFormHelperText";
import { MessageKeyType } from "@myorg/shared/i18n";
import { useTranslations } from "next-intl";
import {
    Controller,
    FieldError,
    FieldValues,
    Path,
    useFormContext,
} from "react-hook-form";
import { snackbarError } from "@/utils/snackbar/snackbar.error";
import { StyledFormControl } from "@/components/ui/StyledFormControl";

type FormDropZoneProps<T extends FieldValues> = {
    name: Path<T>;
    helperText?: string;
} & Omit<DropZoneProps, "error" | "onFiles">;

export default function FormDropZone<T extends FieldValues>({
    name,
    helperText,
    ...props
}: FormDropZoneProps<T>) {
    const t = useTranslations();
    const {
        control,
        formState: { errors },
    } = useFormContext<T>();

    const fieldErrors = errors[name];

    useEffect(() => {
        if (!Array.isArray(fieldErrors)) return;
        const messages = [
            ...new Set(
                (fieldErrors as Array<FieldError | undefined>)
                    .filter((e) => e?.message)
                    .map((e) => e!.message!),
            ),
        ];
        messages.forEach((msg) => snackbarError(t(msg as MessageKeyType)));
    }, [fieldErrors, t]);
    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange }, fieldState: { error } }) => (
                <StyledFormControl
                    sx={{ display: "flex", flexDirection: "column", flex: 1 }}
                    error={!!error?.message}
                >
                    <DropZone
                        onFiles={(files) =>
                            onChange(
                                props.multiple ? files : (files[0] ?? null),
                            )
                        }
                        error={!!error?.message}
                        {...props}
                    />
                    {
                        <StyledFormHelperText>
                            {error?.message
                                ? t(error.message as MessageKeyType)
                                : helperText}
                        </StyledFormHelperText>
                    }
                </StyledFormControl>
            )}
        />
    );
}
