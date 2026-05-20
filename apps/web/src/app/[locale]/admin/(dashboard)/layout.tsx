import HeaderAdmin from "@/components/layout/header/admin/HeaderAdmin";

export default async function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <HeaderAdmin />
            {children}
        </>
    );
}
