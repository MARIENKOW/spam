import { differenceInDays, format } from "date-fns";
import { AvailableLanguage } from "../i18n";
import { DATE_FNS_LOCALES, DEFAULT_LOCALE, relativeTime } from "./relativeTime";

const RELATIVE_THRESHOLD_DAYS = 5;

/**
 * Recent events (< 7 days): relative — "3 дня назад", "вчера"
 * Older events: absolute — "10 апр. 2026" or "10 апр. 2026, 14:30"
 */
export function smartDate({
    date,
    locale,
}: {
    date: Date;
    locale: AvailableLanguage;
}): string {
    const daysDiff = Math.abs(differenceInDays(new Date(), date));

    if (daysDiff < RELATIVE_THRESHOLD_DAYS) {
        return relativeTime({ date, locale });
    }

    const dateLocale = DATE_FNS_LOCALES[locale] ?? DEFAULT_LOCALE;
    const pattern = "d MMM yyyy, HH:mm";
    return format(date, pattern, { locale: dateLocale });
}
