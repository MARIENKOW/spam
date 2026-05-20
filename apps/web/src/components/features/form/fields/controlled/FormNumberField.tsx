import { FormFieldProps } from "@/components/features/form/fields/types";
import { StyledTextField } from "@/components/ui/StyledTextField";
import FieldControll from "@/components/wrappers/form/FieldControll";
import { useFormConfig } from "@/components/wrappers/form/FormConfigProvider";
import { MessageKeyType } from "@myorg/shared/i18n";
import { useTranslations } from "next-intl";
import { FieldValues } from "react-hook-form";

export default function FormNumberField<TFieldValues extends FieldValues>({
    name,
    label,
    variant,
}: FormFieldProps<TFieldValues>) {
    const t = useTranslations();
    const {
        fields: { variant: configVariant },
    } = useFormConfig();

    const finalVariant = variant || configVariant;

    return (
        <FieldControll name={name}>
            {({ field: { value, onChange }, fieldState: { error } }) => (
                <StyledTextField
                    variant={finalVariant}
                    label={label ? t(label) : ""}
                    error={!!error}
                    inputMode="numeric"
                    value={value}
                    onChange={({ target }) => {
                        onChange(target.value);
                    }}
                    helperText={
                        error?.message
                            ? t(error.message as MessageKeyType)
                            : undefined
                    }
                />
            )}
        </FieldControll>
    );
}
