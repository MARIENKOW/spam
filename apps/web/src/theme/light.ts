import { AvailableMode } from "@/theme/theme";
import { ThemeOptions } from "@mui/material";

export const light: ThemeOptions = {
    palette: {
        mode: "light" as AvailableMode,
        primary: {
            main: "#c9973a",
            dark: "#a87828",
            light: "#e0b860",
            contrastText: "#ffffff",
        },
        secondary: {
            main: "#7c5c2a",
            dark: "#5a3e18",
            light: "#a07840",
            contrastText: "#ffffff", // ок, контраст ~6.7:1
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
            main: "#e67e22",
            dark: "#c0621a",
            light: "#f0a050",
            contrastText: "#ffffff", // было "#ffffff" — не читалось
        },
        info: {
            main: "#2980b9",
            dark: "#1a6090",
            light: "#4a9ed0",
            contrastText: "#ffffff",
        },
        background: {
            default: "#ffffff",
            paper: "#f8f4ec",
        },
        text: {
            primary: "#2a1f0e",
            secondary: "#7a6848",
            disabled: "#a89070",
        },
        divider: "#d8ccb0",
        action: {
            active: "#2a1f0e",
            hover: "rgba(201,151,58,0.08)",
            selected: "rgba(201,151,58,0.15)",
            disabled: "#a89070", // синхронизировано с text.disabled
            disabledBackground: "rgba(0,0,0,0.06)",
            focus: "rgba(201,151,58,0.12)",
            hoverOpacity: 0.08,
            selectedOpacity: 0.15, // было 0.25 — не билось с alpha в selected
            disabledOpacity: 0.38,
            focusOpacity: 0.12,
            activatedOpacity: 0.24,
        },
        common: {
            black: "#2a1f0e",
            white: "#f8f4ec",
        },
    },
};
