import { dark } from "@/theme/dark";
import { light } from "@/theme/light";
import { createTheme, ThemeOptions } from "@mui/material";

const THEME_CONFIG: ThemeOptions = {
    cssVariables: {
        colorSchemeSelector: "class",
        disableCssColorScheme: true,
    },
    components: {
        MuiOutlinedInput: {
            styleOverrides: {
                notchedOutline: {
                    "& legend": {
                        transition: "none",
                    },
                },
            },
        },
    },
    typography: {
        fontFamily: "Roboto, Arial, sans-serif",
        fontSize: 13,
        allVariants: {
            letterSpacing: 1.2,
        },
    },
    colorSchemes: {
        light,
        dark,
    },
};

export const theme = createTheme(THEME_CONFIG);

export type AvailableMode = "light" | "dark";

export const modes = ["light", "dark"] as AvailableMode[];

export const defaultThemeMode: AvailableMode = "light";
