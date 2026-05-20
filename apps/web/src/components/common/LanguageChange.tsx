"use client";

import { StyledFormControl } from "@/components/ui/StyledFormControl";
import { StyledMenuItem } from "@/components/ui/StyledMenuItem";
import { StyledSelect } from "@/components/ui/StyledSelect";
import { usePathname, useRouter } from "@/i18n/navigation";
import { SelectChangeEvent } from "@mui/material";
import { useLocale, useTranslations } from "next-intl";
import {
    languages,
    AvailableLanguage,
    defaultLanguage,
} from "@myorg/shared/i18n";
import ReactCountryFlag from "react-country-flag";
import { StyledTooltip } from "@/components/ui/StyledTooltip";
import { useState } from "react";
export function LanguageChange() {
    const router = useRouter();
    const locale = useLocale();
    const [open, setOpen] = useState<boolean>(false);
    const pathname = usePathname();
    const t = useTranslations();

    const handleChange = (event: SelectChangeEvent<unknown>) => {
        setOpen(false);
        const value = event.target.value as AvailableLanguage;
        const lang = languages.includes(value) ? value : defaultLanguage;
        router.replace(pathname, { locale: lang });
    };

    if (languages.length <= 1) return null;

    return (
        <StyledTooltip title={open ? null : t("features.language.name")}>
            <StyledFormControl
                size="small"
                sx={{ display: "inline-block", minWidth: 0 }}
            >
                <StyledSelect
                    sx={{
                        width: "100%",
                        "& .MuiSelect-select": {
                            paddingTop: 0.5,
                            paddingBottom: 0.5,
                            paddingLeft: "8px !important",
                            paddingRight: "27x !important",
                        },
                        "& fieldset": { p: 0 },
                        "& svg": {
                            right: 3,
                        },
                    }}
                    onClick={() => setOpen((value) => !value)}
                    open={open}
                    defaultValue={locale}
                    onChange={handleChange}
                >
                    {languages.map((lang: string) => (
                        <StyledMenuItem key={lang} value={lang}>
                            {/* <ReactCountryFlag
                            svg
                            alt={lang}
                            style={{ width: "1.5em", height: "1.5em" }}
                            countryCode={lang === "en" ? "us" : lang}
                        /> */}
                            {lang}
                        </StyledMenuItem>
                    ))}
                </StyledSelect>
            </StyledFormControl>
        </StyledTooltip>
    );
}
