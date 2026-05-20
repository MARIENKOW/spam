import { TextFieldProps } from "@mui/material";
import { MessageKeyType } from "@myorg/shared/i18n";
import { FieldValues, Path, UseControllerReturn } from "react-hook-form";

type FormBaseProps<TFieldValues extends FieldValues> = {
    name: Path<TFieldValues>;
};

// TextField (с label)
export interface FormFieldProps<TFieldValues extends FieldValues>
    extends FormBaseProps<TFieldValues> {
    label?: MessageKeyType;
    variant?: TextFieldProps["variant"];
}

// Control (без label)
export interface FormControlProps<TFieldValues extends FieldValues>
    extends FormBaseProps<TFieldValues> {
    children: (
        methods: UseControllerReturn<TFieldValues, Path<TFieldValues>>
    ) => React.ReactElement;
}
