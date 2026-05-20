import AuthErrorElement from "@/components/feedback/error/AuthErrorElement";
import { redirect } from "@/i18n/navigation";
import { getAdminAuth } from "@/utils/cache/admin.cache.me";
import { AdminDto } from "@myorg/shared/dto";
import { ADMIN_PRIVATE_FALLBACK_ROUTE } from "@myorg/shared/route";
import { getLocale } from "next-intl/server";
import React from "react";

export default async function AdminPrivateWrapper({
    children,
    role = "ADMIN",
}: {
    role?: AdminDto["role"];
    children: React.ReactNode;
}) {
    const locale = await getLocale();
    const { admin, error } = await getAdminAuth();

    if (error) return <AuthErrorElement />;

    if (!admin || (admin.role === "ADMIN" && role === "SUPERADMIN"))
        redirect({ href: ADMIN_PRIVATE_FALLBACK_ROUTE, locale: locale });
    return children;
}
