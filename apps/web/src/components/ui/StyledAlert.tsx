"use client";

import { Alert, styled } from "@mui/material";

export const StyledAlert = styled(Alert)(({ theme }) => ({
    "&.MuiAlert-filledError": {
        background: theme.vars?.palette.error.main,
        color: theme.vars?.palette.error.contrastText,
        "& .MuiAlert-icon": {
            color: theme.vars?.palette.error.light,
        },
    },
}));
