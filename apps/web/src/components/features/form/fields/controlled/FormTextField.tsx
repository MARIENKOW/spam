import { FormFieldProps } from "@/components/features/form/fields/types";
import { StyledTextField } from "@/components/ui/StyledTextField";
import FieldControll from "@/components/wrappers/form/FieldControll";
import { useFormConfig } from "@/components/wrappers/form/FormConfigProvider";
import { TextFieldProps } from "@mui/material";
import { MessageKeyType } from "@myorg/shared/i18n";
import { useTranslations } from "next-intl";
import { FieldValues, Path, RegisterOptions } from "react-hook-form";

type StyledTextField<T extends FieldValues> = {
    name: Path<T>;
    label: MessageKeyType;
} & TextFieldProps;

export default function FormTextField<T extends FieldValues>({
    name,
    label,
    helperText,
    ...textFildProps
}: StyledTextField<T>) {
    const t = useTranslations();
    const {
        fields: { variant: configVariant },
    } = useFormConfig();

    return (
        <FieldControll name={name}>
            {({ field, fieldState: { error } }) => (
                <StyledTextField
                    variant={configVariant}
                    label={label ? t(label) : ""}
                    error={!!error}
                    {...textFildProps}
                    {...field}
                    helperText={
                        error?.message
                            ? t(error.message as MessageKeyType)
                            : helperText
                    }
                />
            )}
        </FieldControll>
    );
}
