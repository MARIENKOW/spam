import AuthErrorElement from "@/components/feedback/error/AuthErrorElement";
import { redirect } from "@/i18n/navigation";
import { getUserAuth } from "@/utils/cache/user.cache.me";
import { USER_PRIVATE_FALLBACK_ROUTE } from "@myorg/shared/route";
import { getLocale } from "next-intl/server";
import React from "react";

export default async function UserPrivateWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const locale = await getLocale();
    const { user, error } = await getUserAuth();

    if (error) return <AuthErrorElement />;

    if (!user) redirect({ href: USER_PRIVATE_FALLBACK_ROUTE, locale: locale });
    return children;
}
