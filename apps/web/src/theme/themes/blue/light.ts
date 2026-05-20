import { ThemeOptions } from "@mui/material";

export const light: ThemeOptions = {
    palette: {
        mode: "light",
        primary: {
            main: "#2563eb",
            dark: "#1d4ed8",
            light: "#60a5fa",
            contrastText: "#ffffff",
        },
        secondary: {
            main: "#0891b2",
            dark: "#0e7490",
            light: "#22d3ee",
            contrastText: "#ffffff",
        },
        success: {
            main: "#059669",
            dark: "#047857",
            light: "#34d399",
            contrastText: "#ffffff",
        },
        error: {
            main: "#dc2626",
            dark: "#b91c1c",
            light: "#f87171",
            contrastText: "#ffffff",
        },
        warning: {
            main: "#d97706",
            dark: "#b45309",
            light: "#fbbf24",
            contrastText: "#ffffff",
        },
        info: {
            main: "#0284c7",
            dark: "#0369a1",
            light: "#38bdf8",
            contrastText: "#ffffff",
        },
        background: { default: "#f8fafc", paper: "#ffffff" },
        text: { primary: "#0f172a", secondary: "#475569", disabled: "#94a3b8" },
        divider: "#e2e8f0",
        action: {
            active: "#0f172a",
            hover: "rgba(37,99,235,0.08)",
            selected: "rgba(37,99,235,0.16)",
            disabled: "#cbd5e1",
            disabledBackground: "rgba(0,0,0,0.06)",
            focus: "rgba(37,99,235,0.16)",
            hoverOpacity: 0.08,
            selectedOpacity: 0.16,
            disabledOpacity: 0.38,
            focusOpacity: 0.16,
            activatedOpacity: 0.24,
        },
        common: { black: "#0f172a", white: "#ffffff" },
    },
};
