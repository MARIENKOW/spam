"use client";

import { Button, styled } from "@mui/material";

export const StyledButton = styled(Button)(({ theme }) => ({
    // "&.Mui-disabled": {
    //     background: theme.palette.primary.main,
    //     color: theme.palette.primary.contrastText,
    //     opacity: "0.3",
    // },
    // "&.MuiLoadingButton-loading": {
    //     background: theme.palette.primary.main,
    //     color: theme.palette.primary.main,
    //     opacity: "0.3",
    //     "& .MuiLoadingButton-loadingIndicator": {
    //         color: theme.palette.primary.contrastText,
    //     },
    // },
}));
