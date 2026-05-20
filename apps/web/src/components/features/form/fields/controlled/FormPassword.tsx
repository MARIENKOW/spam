import { FormFieldProps } from "@/components/features/form/fields/types";
import { PasswordComponent } from "@/components/features/form/fields/uncontrolled/PasswordComponent";
import { StyledTextField } from "@/components/ui/StyledTextField";
import FieldControll from "@/components/wrappers/form/FieldControll";
import { useFormConfig } from "@/components/wrappers/form/FormConfigProvider";
import { MessageKeyType } from "@myorg/shared/i18n";
import { useTranslations } from "next-intl";
import { FieldValues, Path, RegisterOptions } from "react-hook-form";

export default function FormPassword<TFieldValues extends FieldValues>({
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
                <PasswordComponent
                    variant={finalVariant}
                    label={label ? t(label) : ""}
                    error={!!error}
                    value={value}
                    onChange={onChange}
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
