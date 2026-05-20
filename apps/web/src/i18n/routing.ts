import { defineRouting } from "next-intl/routing";
import { defaultLanguage, languages, MessageStructure } from "@myorg/shared/i18n";

export const routing = defineRouting({
    locales: languages,
    defaultLocale: defaultLanguage,
    localePrefix: "as-needed",
    // localeDetection:false
});

declare module "next-intl" {
    interface AppConfig {
        Locale: (typeof routing.locales)[number];
        Messages: MessageStructure;
    }
}
