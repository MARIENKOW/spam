import { ThemeOptions } from "@mui/material";

export const light: ThemeOptions = {
    palette: {
        mode: "light",
        primary: {
            main: "#8a6898",
            dark: "#684870",
            light: "#b098c8",
            contrastText: "#ffffff",
        },
        secondary: {
            main: "#6a8a58",
            dark: "#4e6840",
            light: "#8aaa78",
            contrastText: "#ffffff",
        },
        success: {
            main: "#4a7838",
            dark: "#365820",
            light: "#70a060",
            contrastText: "#ffffff",
        },
        error: {
            main: "#a85040",
            dark: "#803828",
            light: "#c87868",
            contrastText: "#ffffff",
        },
        warning: {
            main: "#a87828",
            dark: "#806018",
            light: "#c89848",
            contrastText: "#ffffff",
        },
        info: {
            main: "#4a7898",
            dark: "#305878",
            light: "#6898b8",
            contrastText: "#ffffff",
        },
        background: { default: "#f5f2ec", paper: "#fcfaf6" },
        text: { primary: "#2a2030", secondary: "#685870", disabled: "#b0a8bc" },
        divider: "#ddd4e4",
        action: {
            active: "#2a2030",
            hover: "rgba(138,104,152,0.08)",
            selected: "rgba(138,104,152,0.16)",
            disabled: "#c8c0d4",
            disabledBackground: "rgba(0,0,0,0.06)",
            focus: "rgba(138,104,152,0.16)",
            hoverOpacity: 0.08,
            selectedOpacity: 0.16,
            disabledOpacity: 0.38,
            focusOpacity: 0.16,
            activatedOpacity: 0.24,
        },
        common: { black: "#2a2030", white: "#ffffff" },
    },
};
