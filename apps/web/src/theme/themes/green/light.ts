import { ThemeOptions } from "@mui/material";

export const light: ThemeOptions = {
    palette: {
        mode: "light",
        primary: {
            main: "#6a8550",
            dark: "#4d6338",
            light: "#9ab878",
            contrastText: "#ffffff",
        },
        secondary: {
            main: "#a85a2e",
            dark: "#82421c",
            light: "#c47a4e",
            contrastText: "#ffffff",
        },
        success: {
            main: "#0e7a4e",
            dark: "#085a38",
            light: "#3aa074",
            contrastText: "#ffffff",
        },
        error: {
            main: "#b04a2e",
            dark: "#853418",
            light: "#d06a4a",
            contrastText: "#ffffff",
        },
        warning: {
            main: "#c47828",
            dark: "#9a5a18",
            light: "#e09852",
            contrastText: "#ffffff",
        },
        info: {
            main: "#3a7aa0",
            dark: "#255a80",
            light: "#5a9abc",
            contrastText: "#ffffff",
        },
        background: { default: "#f4f1e4", paper: "#ffffff" },
        text: { primary: "#1e2416", secondary: "#5a6248", disabled: "#a8ac90" },
        divider: "#d8d8c0",
        action: {
            active: "#1e2416",
            hover: "rgba(106,133,80,0.08)",
            selected: "rgba(106,133,80,0.16)",
            disabled: "#c0c4a8",
            disabledBackground: "rgba(0,0,0,0.06)",
            focus: "rgba(106,133,80,0.16)",
            hoverOpacity: 0.08,
            selectedOpacity: 0.16,
            disabledOpacity: 0.38,
            focusOpacity: 0.16,
            activatedOpacity: 0.24,
        },
        common: { black: "#1e2416", white: "#ffffff" },
    },
};
