import { AvailableLanguage, languages } from "@myorg/shared/i18n";

export function isEqualPath(PRIVATE_PATHS: string[], pathname: string) {
    return PRIVATE_PATHS.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`),
    );
}

export function getPathnameWithoutLocale(pathnameDirty: string): {
    pathname: string;
    locale: AvailableLanguage | null;
} {
    for (const locale of languages) {
        if (
            pathnameDirty === `/${locale}` ||
            pathnameDirty.startsWith(`/${locale}/`)
        ) {
            return {
                pathname: pathnameDirty.slice(locale.length + 1),
                locale,
            }; // Убираем /en/
        }
    }
    return { pathname: pathnameDirty, locale: null };
}
