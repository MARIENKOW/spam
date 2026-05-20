
import { formatDistanceToNow, } from "date-fns";
import type { Locale } from "date-fns";
import { enUS, ru } from "date-fns/locale";
import { AvailableLanguage } from "../i18n";

export const DATE_FNS_LOCALES: Record<AvailableLanguage, Locale> = {
    ru,
    en: enUS,
};

export const DEFAULT_LOCALE = enUS;

export function relativeTime({
    date,
    locale,
}: {
    date: Date;
    locale: AvailableLanguage;
}) {
    return formatDistanceToNow(date, {
        addSuffix: true,
        locale: DATE_FNS_LOCALES[locale] ?? DEFAULT_LOCALE,
    });
}
