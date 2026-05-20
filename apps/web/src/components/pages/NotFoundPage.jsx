import { getTranslations } from "next-intl/server";

export default async function NotFoundPage() {
    const t = await getTranslations();
    return t("pages.notFound.name");
}
