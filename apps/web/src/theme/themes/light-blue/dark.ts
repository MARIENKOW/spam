import { ThemeOptions } from "@mui/material";

export const dark: ThemeOptions = {
    palette: {
        mode: "dark",
        primary: {
            main: "#4dc8c4",
            dark: "#2aaa9e",
            light: "#7de8e4",
            contrastText: "#0a1e1e",
        },
        secondary: {
            main: "#e05a80",
            dark: "#c03860",
            light: "#ec84a0",
            contrastText: "#2a0515",
        },
        success: {
            main: "#4ab89a",
            dark: "#2a9878",
            light: "#72ccb4",
            contrastText: "#061e18",
        },
        error: {
            main: "#e04868",
            dark: "#c02848",
            light: "#ec7288",
            contrastText: "#2a0510",
        },
        warning: {
            main: "#e0b060",
            dark: "#c09040",
            light: "#eccc84",
            contrastText: "#2a1e08",
        },
        info: {
            main: "#6090c8",
            dark: "#4070a8",
            light: "#88b0d8",
            contrastText: "#0a1428",
        },
        background: { default: "#080e1a", paper: "#101820" },
        text: { primary: "#c8e8e0", secondary: "#6a9898", disabled: "#2e5050" },
        divider: "#142028",
        action: {
            active: "#c8e8e0",
            hover: "rgba(77,200,196,0.08)",
            selected: "rgba(77,200,196,0.16)",
            disabled: "#1e3838",
            disabledBackground: "rgba(255,255,255,0.06)",
            focus: "rgba(42,170,158,0.16)",
            hoverOpacity: 0.08,
            selectedOpacity: 0.16,
            disabledOpacity: 0.38,
            focusOpacity: 0.16,
            activatedOpacity: 0.24,
        },
        common: { black: "#080e1a", white: "#c8e8e0" },
    },
};
