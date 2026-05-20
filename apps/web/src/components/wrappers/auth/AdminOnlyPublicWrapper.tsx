import AuthErrorElement from "@/components/feedback/error/AuthErrorElement";
import { redirect } from "@/i18n/navigation";
import { getAdminAuth } from "@/utils/cache/admin.cache.me";
import { ADMIN_PUBLIC_FALLBACK_ROUTE } from "@myorg/shared/route";
import { getLocale } from "next-intl/server";
import React from "react";

export default async function AdminOnlyPublicWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const locale = await getLocale();
    const { admin, error } = await getAdminAuth();
    if (error) return <AuthErrorElement />;

    if (admin) redirect({ href: ADMIN_PUBLIC_FALLBACK_ROUTE, locale: locale });
    return children;
}
