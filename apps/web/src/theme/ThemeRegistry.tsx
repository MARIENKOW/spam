"use client";

import * as React from "react";
import { ThemeProvider, CssBaseline, useColorScheme } from "@mui/material";
import { AvailableMode, theme } from "@/theme/theme";
import { setThemeMode } from "@/theme/themeMode";

type ThemeRegistryType = {
    themeMode: AvailableMode;
    children: React.ReactNode;
};

export default function ThemeRegistry({
    themeMode,
    children,
}: ThemeRegistryType) {
    return (
        <ThemeProvider
            storageManager={null}
            defaultMode={themeMode}
            theme={theme}
        >
            <CssBaseline enableColorScheme />
            {children}
        </ThemeProvider>
    );
}

export function useThemeContext(serverMode: AvailableMode) {
    const { mode, setMode } = useColorScheme();
    const themeMode = mode !== undefined ? mode : serverMode;
    const changeTheme = async (theme: AvailableMode) => {
        setMode(theme);
        await setThemeMode(theme);
    };
    return { themeMode, changeTheme };
}
