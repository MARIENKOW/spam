import { StyledFilledInput } from "@/components/ui/StyledFilledInput";
import { StyledOutlinedInput } from "@/components/ui/StyledOutlinedInput";
import { StyledStandartInput } from "@/components/ui/StyledStandartInput";
import { InputProps, OutlinedInputProps, TextFieldProps } from "@mui/material";

interface InputComponentProps extends OutlinedInputProps {
    variant?: TextFieldProps["variant"];
}

export default function InputComponent(props: InputComponentProps) {
    if (props.variant === "filled") return <StyledFilledInput {...props} />;
    if (props.variant === "standard") return <StyledStandartInput {...props} />;

    return <StyledOutlinedInput {...props} />;
}
