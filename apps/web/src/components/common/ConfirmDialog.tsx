import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    useTheme,
    Slide,
    SlideProps,
    Paper,
} from "@mui/material";
import { StyledDialog } from "@/components/ui/StyledDialog";
import { StyledButton } from "@/components/ui/StyledButton";
import { StyledTypography } from "@/components/ui/StyledTypography";
import { useTranslations } from "next-intl";

interface ConfirmDialogProps {
    open: boolean;
    title?: string;
    description?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    open,
    title,
    description,
    onConfirm,
    onCancel,
}) => {
    const t = useTranslations();
    return (
        <StyledDialog
            open={open}
            onClose={onCancel}
            slotProps={{
                paper: {
                    sx: {
                        p: 2,
                    },
                },
            }}
        >
            <DialogTitle
                color="text.primary"
                sx={{
                    textAlign: "center",
                }}
            >
                {title || t("components.confirmDialog.title")}
            </DialogTitle>

            <DialogContent sx={{ textAlign: "center", py: 1 }}>
                <StyledTypography variant="body1" color="text.secondary">
                    {description}
                </StyledTypography>
            </DialogContent>

            <DialogActions sx={{ justifyContent: "center", gap: 1, pt: 2 }}>
                <StyledButton
                    onClick={onCancel}
                    variant="outlined"
                    color="error"
                >
                    {t("common.cancel")}
                </StyledButton>
                <StyledButton
                    onClick={onConfirm}
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
