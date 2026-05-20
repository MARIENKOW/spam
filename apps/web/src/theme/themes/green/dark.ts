import { ThemeOptions } from "@mui/material";

export const dark: ThemeOptions = {
    palette: {
        mode: "dark",
        primary: {
            main: "#a0b77f",
            dark: "#7e9660",
            light: "#c5d8a8",
            contrastText: "#1a2410",
        },
        secondary: {
            main: "#b8754a",
            dark: "#96582e",
            light: "#d4966e",
            contrastText: "#2a1408",
        },
        success: {
            main: "#5fb083",
            dark: "#3f8e63",
            light: "#8acba8",
            contrastText: "#0a2418",
        },
        error: {
            main: "#d47a5a",
            dark: "#b25a3c",
            light: "#e0987e",
            contrastText: "#2a0e05",
        },
        warning: {
            main: "#d4a060",
            dark: "#b08040",
            light: "#e4bc8c",
            contrastText: "#2a1c0a",
        },
        info: {
            main: "#8ca8c4",
            dark: "#6a88a4",
            light: "#acc0d6",
            contrastText: "#0f1a2a",
        },
        background: { default: "#1a1e16", paper: "#252a20" },
        text: { primary: "#e6e8d8", secondary: "#9ca080", disabled: "#5a5e48" },
        divider: "#2e3226",
        action: {
            active: "#e6e8d8",
            hover: "rgba(160,183,127,0.08)",
            selected: "rgba(160,183,127,0.16)",
            disabled: "#3e4236",
            disabledBackground: "rgba(255,255,255,0.06)",
            focus: "rgba(184,117,74,0.16)",
            hoverOpacity: 0.08,
            selectedOpacity: 0.16,
            disabledOpacity: 0.38,
            focusOpacity: 0.16,
            activatedOpacity: 0.24,
        },
        common: { black: "#1a1e16", white: "#e6e8d8" },
    },
};
