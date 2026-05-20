import { ThemeOptions } from "@mui/material";

export const dark: ThemeOptions = {
    palette: {
        mode: "dark",
        primary: {
            main: "#f2a6b8",
            dark: "#e07a92",
            light: "#fac6d4",
            contrastText: "#2a0e17",
        },
        secondary: {
            main: "#d65a5a",
            dark: "#b8434a",
            light: "#e88080",
            contrastText: "#2a0a0a",
        },
        success: {
            main: "#7ac79a",
            dark: "#5aa67c",
            light: "#9ad9b5",
            contrastText: "#0f2a1c",
        },
        error: {
            main: "#e06b7a",
            dark: "#c04858",
            light: "#ec8b98",
            contrastText: "#2a0a12",
        },
        warning: {
            main: "#e0b084",
            dark: "#c08f64",
            light: "#ecc8a4",
            contrastText: "#2a1c0e",
        },
        info: {
            main: "#9cb8d4",
            dark: "#7a98ba",
            light: "#bccce0",
            contrastText: "#0f1a2a",
        },
        background: { default: "#1a1520", paper: "#251e2d" },
        text: { primary: "#f4e8ed", secondary: "#b090a0", disabled: "#6a5868" },
        divider: "#2f2638",
        action: {
            active: "#f4e8ed",
            hover: "rgba(242,166,184,0.08)",
            selected: "rgba(242,166,184,0.16)",
            disabled: "#4a3d48",
            disabledBackground: "rgba(255,255,255,0.06)",
            focus: "rgba(224,122,146,0.16)",
            hoverOpacity: 0.08,
            selectedOpacity: 0.16,
            disabledOpacity: 0.38,
            focusOpacity: 0.16,
            activatedOpacity: 0.24,
        },
        common: { black: "#1a1520", white: "#f4e8ed" },
    },
};
