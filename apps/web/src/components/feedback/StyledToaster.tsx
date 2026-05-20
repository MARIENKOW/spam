"use client";

import { Toaster } from "sonner";
import { useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useThemeContext } from "@/theme/ThemeRegistry";
import { AvailableMode } from "@/theme/theme";

export const StyledToaster = ({
    serverMode,
}: {
    serverMode: AvailableMode;
}) => {
    const { themeMode } = useThemeContext(serverMode);
    const theme = useTheme();
    const isDark = themeMode === "dark";
    const v = theme.vars!;
    const { typography, shape } = theme;

    return (
        <Toaster
            theme={themeMode}
            position="bottom-right"
            richColors
            expand
            gap={8}
            closeButton
            toastOptions={{ duration: 4000 }}
            style={
                {
                    fontFamily: typography.fontFamily,
                    "--border-radius": `${Number(shape.borderRadius) * 1.5}px`,

                    // ── Normal ────────────────────────────────────
                    "--normal-bg": v.palette.background.paper,
                    "--normal-text": v.palette.text.primary,
                    "--normal-border": v.palette.divider,

                    // ── Success ───────────────────────────────────
                    "--success-bg": isDark
                        ? `rgba(${v.palette.success.darkChannel} / 0.4)`
                        : `rgba(${v.palette.success.lightChannel} / 0.5)`,
                    "--success-text": v.palette.success.main,
                    "--success-border": `rgba(${v.palette.success.mainChannel} / 0.4)`,

                    // ── Error ─────────────────────────────────────
                    "--error-bg": isDark
                        ? `rgba(${v.palette.error.darkChannel} / 0.4)`
                        : `rgba(${v.palette.error.lightChannel} / 0.5)`,
                    "--error-text": v.palette.error.main,
                    "--error-border": `rgba(${v.palette.error.mainChannel} / 0.4)`,

                    // ── Warning ───────────────────────────────────
                    "--warning-bg": isDark
                        ? `rgba(${v.palette.warning.darkChannel} / 0.4)`
                        : `rgba(${v.palette.warning.lightChannel} / 0.5)`,
                    "--warning-text": v.palette.warning.main,
                    "--warning-border": `rgba(${v.palette.warning.mainChannel} / 0.4)`,

                    // ── Info ──────────────────────────────────────
                    "--info-bg": isDark
                        ? `rgba(${v.palette.info.darkChannel} / 0.4)`
                        : `rgba(${v.palette.info.lightChannel} / 0.5)`,
                    "--info-text": v.palette.info.main,
                    "--info-border": `rgba(${v.palette.info.mainChannel} / 0.4)`,
                } as React.CSSProperties
            }
        />
    );
};
