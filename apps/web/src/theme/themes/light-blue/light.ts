import { ThemeOptions } from "@mui/material";

export const light: ThemeOptions = {
    palette: {
        mode: "light",
        primary: {
            main: "#0a7a70",
            dark: "#065855",
            light: "#3aaa9e",
            contrastText: "#ffffff",
        },
        secondary: {
            main: "#a83455",
            dark: "#80203e",
            light: "#d05878",
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
        background: { default: "#eef8f8", paper: "#ffffff" },
        text: { primary: "#0a2020", secondary: "#385858", disabled: "#80a0a0" },
        divider: "#c0dede",
        action: {
            active: "#0a2020",
            hover: "rgba(10,122,112,0.08)",
            selected: "rgba(10,122,112,0.16)",
            disabled: "#a0c4c4",
            disabledBackground: "rgba(0,0,0,0.06)",
            focus: "rgba(10,122,112,0.16)",
            hoverOpacity: 0.08,
            selectedOpacity: 0.16,
            disabledOpacity: 0.38,
            focusOpacity: 0.16,
            activatedOpacity: 0.24,
        },
        common: { black: "#0a2020", white: "#ffffff" },
    },
};
