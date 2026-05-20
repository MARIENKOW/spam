import humanizeDuration from "humanize-duration";
import { AvailableLanguage, defaultLanguage } from "../i18n";

export function formatDuration(ms: number, lang: AvailableLanguage): string {
    const language = lang ?? defaultLanguage;
    return humanizeDuration(ms, {
        language,
        largest: 2,
        round: true,
        fallbacks: ["en"],
    });
}
