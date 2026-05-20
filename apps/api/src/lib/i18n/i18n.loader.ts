import { Injectable } from "@nestjs/common";
import { I18nLoader, I18nTranslation } from "nestjs-i18n";
import { AvailableLanguage, languages, messagesMap } from "@myorg/shared/i18n";

@Injectable()
export class TsI18nLoader implements I18nLoader {
    // Обязательное свойство
    languages = (): Promise<AvailableLanguage[]> => Promise.resolve(languages);

    async load(): Promise<I18nTranslation> {
        return messagesMap;
    }
}
