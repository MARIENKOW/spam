"use client";

import AuthErrorElement from "@/components/feedback/error/AuthErrorElement";
import { StyledButton } from "@/components/ui/StyledButton";
import { StyledDialog } from "@/components/ui/StyledDialog";
import { Box } from "@mui/material";
import { useState } from "react";

export default function AuthErrorWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState<boolean>(false);
    const handleClose = () => {
        setOpen((open) => !open);
    };
    return (
        <>
            <StyledButton
                onClick={handleClose}
                sx={{
                    position: "relative",
                    zIndex: 1,
                    display: "inline-flex",
                    p: 0,
                }}
            >
                {children}
            </StyledButton>
            <StyledDialog onClose={handleClose} open={open}>
                <Box p={3}>
                    <AuthErrorElement />
                </Box>
            </StyledDialog>
        </>
    );
}
