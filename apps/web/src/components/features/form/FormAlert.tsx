import { StyledAlert } from "@/components/ui/StyledAlert";

import { useFormContext, useFormState } from "react-hook-form";

export default function FormAlert() {
    const { control } = useFormContext();

    const { errors } = useFormState({
        control,
    });
    if (!errors?.root?.server?.message) return null;
    return (
        <StyledAlert severity="error">{errors.root.server.message}</StyledAlert>
    );
}
