"use client";

import { Avatar, styled } from "@mui/material";

export const StyledAvatar = styled(Avatar)(({ theme }) => ({
    border: "1px solid",
    borderColor: theme.vars?.palette.divider,
}));
