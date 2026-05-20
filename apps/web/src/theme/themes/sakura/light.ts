import { ThemeOptions } from "@mui/material";

export const light: ThemeOptions = {
    palette: {
        mode: "light",
        primary: {
            main: "#c47285",
            dark: "#9d5068",
            light: "#e09fb0",
            contrastText: "#ffffff",
        },
        secondary: {
            main: "#b8434a",
            dark: "#8e2e36",
            light: "#d66a70",
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
        background: { default: "#faf4f0", paper: "#ffffff" },
        text: { primary: "#2a1a20", secondary: "#6a5258", disabled: "#b89aa0" },
        divider: "#e8d8dc",
        action: {
            active: "#2a1a20",
            hover: "rgba(196,114,133,0.08)",
            selected: "rgba(196,114,133,0.16)",
            disabled: "#c9b5bb",
            disabledBackground: "rgba(0,0,0,0.06)",
            focus: "rgba(196,114,133,0.16)",
            hoverOpacity: 0.08,
            selectedOpacity: 0.16,
            disabledOpacity: 0.38,
            focusOpacity: 0.16,
            activatedOpacity: 0.24,
        },
        common: { black: "#2a1a20", white: "#ffffff" },
    },
};
