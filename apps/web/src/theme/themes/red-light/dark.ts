import { ThemeOptions } from "@mui/material";

export const dark: ThemeOptions = {
    palette: {
        mode: "dark",
        primary: {
            main: "#c4566a",
            dark: "#a83a52",
            light: "#d98094",
            contrastText: "#2a0815",
        },
        secondary: {
            main: "#c9a267",
            dark: "#a88248",
            light: "#dcbc8c",
            contrastText: "#2a1e0a",
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
            main: "#d4a574",
            dark: "#b08554",
            light: "#e4bf94",
            contrastText: "#2a1c0e",
        },
        info: {
            main: "#8ca8c4",
            dark: "#6a88a4",
            light: "#acc0d6",
            contrastText: "#0f1a2a",
        },
        background: { default: "#1a1014", paper: "#241a20" },
        text: { primary: "#ede0d8", secondary: "#a89080", disabled: "#605050" },
        divider: "#3a2a2e",
        action: {
            active: "#ede0d8",
            hover: "rgba(196,86,106,0.08)",
            selected: "rgba(196,86,106,0.16)",
            disabled: "#4a3a3e",
            disabledBackground: "rgba(255,255,255,0.06)",
            focus: "rgba(201,162,103,0.16)",
            hoverOpacity: 0.08,
            selectedOpacity: 0.16,
            disabledOpacity: 0.38,
            focusOpacity: 0.16,
            activatedOpacity: 0.24,
        },
        common: { black: "#1a1014", white: "#ede0d8" },
    },
};
