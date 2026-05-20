import AdminsPage from "@/app/[locale]/admin/(dashboard)/(dashboard)/admins/AdminsPage";

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<unknown>;
}) {
    return <AdminsPage searchParams={searchParams} />;
}
