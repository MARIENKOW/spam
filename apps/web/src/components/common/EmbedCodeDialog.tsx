import React, { useEffect, useRef } from "react";
import { DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { StyledDialog } from "@/components/ui/StyledDialog";
import { StyledButton } from "@/components/ui/StyledButton";
import { StyledTextField } from "@/components/ui/StyledTextField";
import { StyledTypography } from "@/components/ui/StyledTypography";
import { useTranslations } from "next-intl";

interface EmbedCodeDialogProps {
    open: boolean;
    onConfirm: (code: string) => void;
    onCancel: () => void;
}

export const EmbedCodeDialog: React.FC<EmbedCodeDialogProps> = ({ open, onConfirm, onCancel }) => {
    const t = useTranslations();
    const [value, setValue] = React.useState("");
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (open) {
            setValue("");
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    const handleConfirm = () => onConfirm(value);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Escape") onCancel();
        if (e.key === "Tab") {
            e.preventDefault();
            const el = inputRef.current;
            if (!el) return;
            const start = el.selectionStart ?? 0;
            const end = el.selectionEnd ?? 0;
            const next = value.substring(0, start) + "  " + value.substring(end);
            setValue(next);
            requestAnimationFrame(() => el.setSelectionRange(start + 2, start + 2));
        }
    };

    return (
        <StyledDialog
            open={open}
            onClose={onCancel}
            fullWidth
            maxWidth="sm"
            slotProps={{ paper: { sx: { p: 2 } } }}
        >
            <DialogTitle color="text.primary">Insert embed code</DialogTitle>

            <DialogContent sx={{ pb: 1, overflow: "visible" }}>
                <StyledTypography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                    Paste your &lt;iframe&gt; or any embed snippet (YouTube, Google Maps, etc.)
                </StyledTypography>
                <StyledTextField
                    inputRef={inputRef}
                    fullWidth
                    multiline
                    rows={8}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={'<iframe src="https://..." ...></iframe>'}
                    spellCheck={false}
                    slotProps={{ input: { style: { fontFamily: "monospace", fontSize: 13, lineHeight: 1.6 } } }}
                />
            </DialogContent>

            <DialogActions sx={{ justifyContent: "flex-end", gap: 1, pt: 0 }}>
                <StyledButton onClick={onCancel} variant="outlined" color="error">
                    {t("common.cancel")}
                </StyledButton>
                <StyledButton
                    onClick={handleConfirm}
                    variant="contained"
                    color="primary"
                    disabled={!value.trim()}
                >
                    {t("common.confirm")}
                </StyledButton>
            </DialogActions>
        </StyledDialog>
    );
};
