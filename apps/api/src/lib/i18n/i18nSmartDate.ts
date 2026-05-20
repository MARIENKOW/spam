import { AvailableLanguage, defaultLanguage } from "@myorg/shared/i18n";
import { smartDate } from "@myorg/shared/utils";
import { I18nContext } from "nestjs-i18n";

export default function i18nSmartDate(date: Date) {
    const locale =
        (I18nContext.current()?.lang as AvailableLanguage) ?? defaultLanguage;

    return smartDate({ date, locale });
}
