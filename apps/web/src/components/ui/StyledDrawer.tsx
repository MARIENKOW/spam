"use client";

import { Drawer, styled } from "@mui/material";

export const StyledDrawer = styled(Drawer)(({ theme }) => ({
    "& .MuiDrawer-paper": {
        backgroundColor: theme.vars?.palette.background.default,
        backgroundImage: "none",
    },
}));
