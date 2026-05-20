"use client";

import { DateTimePickerComponent } from "@/components/features/form/fields/uncontrolled/DateTimePickerComponent";
import FieldControll from "@/components/wrappers/form/FieldControll";
import { useFormConfig } from "@/components/wrappers/form/FormConfigProvider";
import { MessageKeyType } from "@myorg/shared/i18n";
import { useTranslations } from "next-intl";
import { FieldValues, Path } from "react-hook-form";
import { DateTimePickerProps } from "@mui/x-date-pickers/DateTimePicker";

type FormDateTimePickerProps<T extends FieldValues> = {
    name: Path<T>;
    label?: MessageKeyType;
} & Omit<DateTimePickerProps, "value" | "onChange" | "label">;

export default function FormDateTimePicker<T extends FieldValues>({
    name,
    label,
    slotProps,
    ...rest
}: FormDateTimePickerProps<T>) {
    const t = useTranslations();
    const { fields: { variant: configVariant } } = useFormConfig();

    return (
        <FieldControll name={name}>
            {({ field: { value, onChange }, fieldState: { error } }) => (
                <DateTimePickerComponent
                    value={value ?? null}
                    onChange={onChange}
                    label={label ? t(label) : undefined}
                    slotProps={{
                        ...slotProps,
                        textField: {
                            ...(slotProps?.textField as object | undefined),
                            variant: configVariant,
                            error: !!error,
                            helperText: error?.message
                                ? t(error.message as MessageKeyType)
                                : undefined,
                        },
                    }}
                    {...rest}
                />
            )}
        </FieldControll>
    );
}
