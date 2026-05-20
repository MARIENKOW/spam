import AdminAuthProvider from "@/components/wrappers/auth/AdminAuthProvider";
import { getAdminAuth } from "@/utils/cache/admin.cache.me";
import React from "react";

export default async function RootMainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { admin, error } = await getAdminAuth();

    return (
        <AdminAuthProvider admin={admin} error={error}>
            {children}
        </AdminAuthProvider>
    );
}
