import { ThemeOptions } from "@mui/material";

export const light: ThemeOptions = {
    palette: {
        mode: "light",
        primary: {
            main: "#8b2635",
            dark: "#6b1c2a",
            light: "#c4566a",
            contrastText: "#ffffff",
        },
        secondary: {
            main: "#b8864a",
            dark: "#8c632e",
            light: "#d4a574",
            contrastText: "#ffffff",
        },
        success: {
            main: "#2d8a5e",
            dark: "#1a6040",
            light: "#4aad80",
            contrastText: "#ffffff",
        },
        error: {
            main: "#c0392b",
            dark: "#992d22",
            light: "#e05a4e",
            contrastText: "#ffffff",
        },
        warning: {
            main: "#c57a2e",
            dark: "#9a5a1c",
            light: "#e09852",
            contrastText: "#ffffff",
        },
        info: {
            main: "#2980b9",
            dark: "#1a6090",
            light: "#4a9ed0",
            contrastText: "#ffffff",
        },
        background: { default: "#f5ede0", paper: "#fcf7ee" },
        text: { primary: "#2a1a1e", secondary: "#6a5448", disabled: "#b8a090" },
        divider: "#d9c9ae",
        action: {
            active: "#2a1a1e",
            hover: "rgba(139,38,53,0.08)",
            selected: "rgba(139,38,53,0.16)",
            disabled: "#c9b8a8",
            disabledBackground: "rgba(0,0,0,0.06)",
            focus: "rgba(139,38,53,0.16)",
            hoverOpacity: 0.08,
            selectedOpacity: 0.16,
            disabledOpacity: 0.38,
            focusOpacity: 0.16,
            activatedOpacity: 0.24,
        },
        common: { black: "#2a1a1e", white: "#ffffff" },
    },
};
