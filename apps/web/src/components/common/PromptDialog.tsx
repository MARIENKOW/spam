import React, { useEffect, useRef } from "react";
import {
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from "@mui/material";
import { StyledDialog } from "@/components/ui/StyledDialog";
import { StyledButton } from "@/components/ui/StyledButton";
import { useTranslations } from "next-intl";
import { StyledTextField } from "@/components/ui/StyledTextField";
import { StyledFormControl } from "@/components/ui/StyledFormControl";
import { StyledInputLabel } from "@/components/ui/StyledInputLabel";

interface PromptDialogProps {
    open: boolean;
    title?: string;
    label?: string;
    defaultValue?: string;
    onConfirm: (value: string) => void;
    onCancel: () => void;
}

export const PromptDialog: React.FC<PromptDialogProps> = ({
    open,
    title,
    label,
    defaultValue = "",
    onConfirm,
    onCancel,
}) => {
    const t = useTranslations();
    const [value, setValue] = React.useState(defaultValue);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            setValue(defaultValue);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open, defaultValue]);

    const handleConfirm = () => onConfirm(value);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleConfirm();
        if (e.key === "Escape") onCancel();
    };

    return (
        <StyledDialog
            open={open}
            onClose={onCancel}
            slotProps={{ paper: { sx: { p: 2, minWidth: 320 } } }}
        >
            {title && (
                <DialogTitle color="text.primary" sx={{ textAlign: "center" }}>
                    {title}
                </DialogTitle>
            )}

            <DialogContent sx={{ pt: 2, pb: 2, overflow: "visible" }}>
                <StyledTextField
                    inputRef={inputRef}
                    fullWidth
                    size="small"
                    label={label}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </DialogContent>

            <DialogActions sx={{ justifyContent: "center", gap: 1, pt: 1 }}>
                <StyledButton
                    onClick={onCancel}
                    variant="outlined"
                    color="error"
                >
                    {t("common.cancel")}
                </StyledButton>
                <StyledButton
                    onClick={handleConfirm}
                    variant="contained"
                    color="primary"
                    sx={{ minWidth: 100 }}
                >
                    {t("common.confirm")}
                </StyledButton>
            </DialogActions>
        </StyledDialog>
    );
};
