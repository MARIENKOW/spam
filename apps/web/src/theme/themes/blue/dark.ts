import { ThemeOptions } from "@mui/material";

export const dark: ThemeOptions = {
    palette: {
        mode: "dark",
        primary: {
            main: "#60a5fa",
            dark: "#3b82f6",
            light: "#93c5fd",
            contrastText: "#0b1220",
        },
        secondary: {
            main: "#22d3ee",
            dark: "#06b6d4",
            light: "#67e8f9",
            contrastText: "#083344",
        },
        success: {
            main: "#34d399",
            dark: "#10b981",
            light: "#6ee7b7",
            contrastText: "#052e16",
        },
        error: {
            main: "#f87171",
            dark: "#ef4444",
            light: "#fca5a5",
            contrastText: "#450a0a",
        },
        warning: {
            main: "#fbbf24",
            dark: "#f59e0b",
            light: "#fcd34d",
            contrastText: "#451a03",
        },
        info: {
            main: "#93c5fd",
            dark: "#60a5fa",
            light: "#bfdbfe",
            contrastText: "#0c1a3a",
        },
        background: { default: "#0f172a", paper: "#1e293b" },
        text: { primary: "#e2e8f0", secondary: "#94a3b8", disabled: "#475569" },
        divider: "#1e293b",
        action: {
            active: "#e2e8f0",
            hover: "rgba(96,165,250,0.08)",
            selected: "rgba(96,165,250,0.16)",
            disabled: "#334155",
            disabledBackground: "rgba(255,255,255,0.06)",
            focus: "rgba(59,130,246,0.16)",
            hoverOpacity: 0.08,
            selectedOpacity: 0.16,
            disabledOpacity: 0.38,
            focusOpacity: 0.16,
            activatedOpacity: 0.24,
        },
        common: { black: "#0b1220", white: "#e2e8f0" },
    },
};
