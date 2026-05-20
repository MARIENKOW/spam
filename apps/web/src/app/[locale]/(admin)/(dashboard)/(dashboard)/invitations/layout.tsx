import HeaderAdmin from "@/components/layout/header/admin/HeaderAdmin";
import AdminPrivateWrapper from "@/components/wrappers/auth/AdminPrivateWrapper";

export default async function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminPrivateWrapper role="SUPERADMIN">{children}</AdminPrivateWrapper>
    );
}
