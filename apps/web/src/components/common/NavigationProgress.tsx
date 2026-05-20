// components/NavigationProgress.tsx
"use client";

import NextTopLoader from "nextjs-toploader";
import { useTheme } from "@mui/material";

export const NavigationProgress = () => {
    const theme = useTheme();

    return (
        <NextTopLoader
            color={theme.palette.primary.main}
            height={3}
            showSpinner={false}
        />
    );
};
