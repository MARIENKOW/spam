"use client";

import { ColorPickerComponent } from "@/components/features/form/fields/uncontrolled/ColorPickerComponent";
import FieldControll from "@/components/wrappers/form/FieldControll";
import { useFormConfig } from "@/components/wrappers/form/FormConfigProvider";
import { MessageKeyType } from "@myorg/shared/i18n";
import { useTranslations } from "next-intl";
import { FieldValues, Path } from "react-hook-form";
import { MuiColorInputProps } from "mui-color-input";

type FormColorPickerProps<T extends FieldValues> = {
    name: Path<T>;
    label?: MessageKeyType;
} & Omit<MuiColorInputProps, "value" | "onChange" | "label">;

export default function FormColorPicker<T extends FieldValues>({
    name,
    label,
    ...rest
}: FormColorPickerProps<T>) {
    const t = useTranslations();
    const { fields: { variant: configVariant } } = useFormConfig();

    return (
        <FieldControll name={name}>
            {({ field: { value, onChange }, fieldState: { error } }) => (
                <ColorPickerComponent
                    value={value ?? ""}
                    onChange={onChange}
                    label={label ? t(label) : undefined}
                    variant={configVariant}
                    error={!!error}
                    helperText={error?.message ? t(error.message as MessageKeyType) : undefined}
                    fullWidth
                    {...rest}
                />
            )}
        </FieldControll>
    );
}
