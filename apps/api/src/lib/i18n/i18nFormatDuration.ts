import { AvailableLanguage, defaultLanguage } from "@myorg/shared/i18n";
import { formatDuration } from "@myorg/shared/utils";
import { I18nContext } from "nestjs-i18n";

export default function i18nFormatDuration(ms: number) {
    const locale =
        (I18nContext.current()?.lang as AvailableLanguage) ?? defaultLanguage;

    return formatDuration(ms, locale);
}
