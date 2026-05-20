import { InputAdornment, TextFieldProps } from "@mui/material";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import React, { MouseEvent, useState } from "react";
import Visibility from "@mui/icons-material/Visibility";
import { StyledFormControl } from "@/components/ui/StyledFormControl";
import { StyledInputLabel } from "@/components/ui/StyledInputLabel";
import { StyledFilledInput } from "@/components/ui/StyledFilledInput";
import { StyledIconButton } from "@/components/ui/StyledIconButton";
import { StyledFormHelperText } from "@/components/ui/StyledFormHelperText";
import InputComponent from "@/components/features/form/fields/uncontrolled/InputComponent";
import { FieldValue, FieldValues } from "react-hook-form";

type PasswordComponentProps = {
    label: string;
    error?: boolean;
    helperText?: string;
    variant?: TextFieldProps["variant"];
    value?: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
};

export const NumberFieldComponent = ({
    label,
    error,
    helperText,
    variant,
    value,
    onChange,
}: PasswordComponentProps) => {
    return (
        <StyledFormControl error={error} variant={variant}>
            <StyledInputLabel>{label}</StyledInputLabel>
            <InputComponent
                label={label}
                variant={variant}
                type={"number"}
                value={value}
                onChange={onChange}
            />
            <StyledFormHelperText>{helperText}</StyledFormHelperText>
        </StyledFormControl>
    );
};
