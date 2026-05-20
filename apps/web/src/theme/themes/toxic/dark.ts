import { ThemeOptions } from "@mui/material";

export const dark: ThemeOptions = {
    palette: {
        mode: "dark",
        primary: {
            main: "#ec7b5c",
            dark: "#c65840",
            light: "#f5a888",
            contrastText: "#2a0e05",
        },
        secondary: {
            main: "#7a9ad8",
            dark: "#5a7ac0",
            light: "#9cb4e0",
            contrastText: "#0a1428",
        },
        success: {
            main: "#5fb083",
            dark: "#3f8e63",
            light: "#8acba8",
            contrastText: "#0a2418",
        },
        error: {
            main: "#e05060",
            dark: "#b83848",
            light: "#e87c88",
            contrastText: "#2a050a",
        },
        warning: {
            main: "#f0b25a",
            dark: "#c8903a",
            light: "#f5c682",
            contrastText: "#2a1c05",
        },
        info: {
            main: "#9cb4e0",
            dark: "#7a94c8",
            light: "#b8c8e8",
            contrastText: "#0a1428",
        },
        background: { default: "#0e1628", paper: "#182340" },
        text: { primary: "#f0e0c8", secondary: "#a89480", disabled: "#5a5268" },
        divider: "#283250",
        action: {
            active: "#f0e0c8",
            hover: "rgba(236,123,92,0.08)",
            selected: "rgba(236,123,92,0.16)",
            disabled: "#3a3a50",
            disabledBackground: "rgba(255,255,255,0.06)",
            focus: "rgba(122,154,216,0.16)",
            hoverOpacity: 0.08,
            selectedOpacity: 0.16,
            disabledOpacity: 0.38,
            focusOpacity: 0.16,
            activatedOpacity: 0.24,
        },
        common: { black: "#0e1628", white: "#f0e0c8" },
    },
};
