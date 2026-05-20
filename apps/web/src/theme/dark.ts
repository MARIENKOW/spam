import { AvailableMode } from "@/theme/theme";
import { ThemeOptions } from "@mui/material";

export const dark: ThemeOptions = {
    palette: {
        mode: "dark" as AvailableMode,
        primary: {
            main: "#e0b860",
            dark: "#c9973a",
            light: "#f0ce88",
            contrastText: "#1a1408",
        },
        secondary: {
            main: "#c4896a",
            dark: "#a86848",
            light: "#e0aa8a",
            contrastText: "#ffffff",
        },
        success: {
            main: "#34d399",
            dark: "#10b981",
            light: "#6ee7b7",
            contrastText: "#ffffff",
        },
        error: {
            main: "#f87171",
            dark: "#ef4444",
            light: "#fca5a5",
            contrastText: "#ffffff",
        },
        warning: {
            main: "#fbbf24",
            dark: "#f59e0b",
            light: "#fcd34d",
            contrastText: "#ffffff",
        },
        info: {
            main: "#60a5fa",
            dark: "#3b82f6",
            light: "#93c5fd",
            contrastText: "#ffffff",
        },
        background: { default: "#1e1a14", paper: "#2a2418" },
        text: { primary: "#e8dcc0", secondary: "#9a8460", disabled: "#6a5c44" },
        divider: "#302a1e",
        action: {
            active: "#e8dcc0",
            hover: "rgba(224,184,96,0.08)",
            selected: "rgba(224,184,96,0.16)",
            disabled: "#3e3828",
            disabledBackground: "rgba(255,255,255,0.06)",
            focus: "rgba(201,151,58,0.12)",
            hoverOpacity: 0.08,
            selectedOpacity: 0.16,
            disabledOpacity: 0.38,
            focusOpacity: 0.12,
            activatedOpacity: 0.24,
        },
        common: { black: "#1e1a14", white: "#e8dcc0" },
    },
};
