import { ThemeOptions } from "@mui/material";

export const dark: ThemeOptions = {
    palette: {
        mode: "dark",
        primary: {
            main: "#b09ac8",
            dark: "#8878a8",
            light: "#d0c4e0",
            contrastText: "#1e1428",
        },
        secondary: {
            main: "#8aaa7a",
            dark: "#688858",
            light: "#aac49a",
            contrastText: "#142010",
        },
        success: {
            main: "#78a868",
            dark: "#588848",
            light: "#9ac088",
            contrastText: "#102010",
        },
        error: {
            main: "#c07868",
            dark: "#a05848",
            light: "#d89888",
            contrastText: "#2a1008",
        },
        warning: {
            main: "#c8a050",
            dark: "#a88030",
            light: "#dcc07a",
            contrastText: "#28200a",
        },
        info: {
            main: "#88a4c4",
            dark: "#6884a4",
            light: "#a8c0d8",
            contrastText: "#102030",
        },
        background: { default: "#1e1c26", paper: "#2a2838" },
        text: { primary: "#e0d8f0", secondary: "#9a90b8", disabled: "#5a5270" },
        divider: "#302e42",
        action: {
            active: "#e0d8f0",
            hover: "rgba(176,154,200,0.08)",
            selected: "rgba(176,154,200,0.16)",
            disabled: "#3e3c54",
            disabledBackground: "rgba(255,255,255,0.06)",
            focus: "rgba(136,120,168,0.16)",
            hoverOpacity: 0.08,
            selectedOpacity: 0.16,
            disabledOpacity: 0.38,
            focusOpacity: 0.16,
            activatedOpacity: 0.24,
        },
        common: { black: "#1e1c26", white: "#e0d8f0" },
    },
};
