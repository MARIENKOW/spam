"use client";
import { InputAdornment, TextFieldProps } from "@mui/material";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import React, { MouseEvent, useState } from "react";
import Visibility from "@mui/icons-material/Visibility";
import { StyledFormControl } from "@/components/ui/StyledFormControl";
import { StyledInputLabel } from "@/components/ui/StyledInputLabel";
import { StyledIconButton } from "@/components/ui/StyledIconButton";
import { StyledFormHelperText } from "@/components/ui/StyledFormHelperText";
import InputComponent from "@/components/features/form/fields/uncontrolled/InputComponent";
import PasswordOutlinedIcon from "@mui/icons-material/PasswordOutlined";

type PasswordComponentProps = {
    label: string;
    error?: boolean;
    helperText?: string;
    variant?: TextFieldProps["variant"];
    value?: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
};

export const PasswordComponent = ({
    label,
    error,
    helperText,
    variant,
    value,
    onChange,
}: PasswordComponentProps) => {
    const [showPassword, setShowPassword] = useState(false);

    const handleMouseDownPassword = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    return (
        <StyledFormControl error={error} variant={variant}>
            <StyledInputLabel>{label}</StyledInputLabel>
            <InputComponent
                label={label}
                variant={variant}
                type={showPassword ? "text" : "password"}
                value={value}
                onChange={onChange}
                // startAdornment={
                //     <InputAdornment position="start">
                //         <PasswordOutlinedIcon />
                //     </InputAdornment>
                // }
                endAdornment={
                    <InputAdornment position="end">
                        <StyledIconButton
                            onClick={() => setShowPassword((state) => !state)}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                        >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                        </StyledIconButton>
                    </InputAdornment>
                }
            />
            <StyledFormHelperText>{helperText}</StyledFormHelperText>
        </StyledFormControl>
    );
};
