"use client";

import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { enUS, ruRU } from "@mui/x-date-pickers/locales";
import { enUS as fnsEnUS, ru as fnsRu } from "date-fns/locale";
import { useLocale } from "next-intl";
import { ReactNode } from "react";
import { AvailableLanguage } from "@myorg/shared/i18n";

const muiLocales: Record<AvailableLanguage, any> = {
    en: enUS.components.MuiLocalizationProvider.defaultProps.localeText,
    ru: ruRU.components.MuiLocalizationProvider.defaultProps.localeText,
};

const fnsLocales: Record<AvailableLanguage, any> = {
    en: fnsEnUS,
    ru: fnsRu,
};

export function DateLocalizationProvider({ children }: { children: ReactNode }) {
    const locale = useLocale() as AvailableLanguage;

    return (
        <LocalizationProvider
            dateAdapter={AdapterDateFns}
            adapterLocale={fnsLocales[locale]}
            localeText={muiLocales[locale]}
        >
            {children}
        </LocalizationProvider>
    );
}
