import UsersPage from "@/app/[locale]/admin/(dashboard)/(dashboard)/users/UsersPage";

export default async function Page({ searchParams }: { searchParams: Promise<unknown> }) {
    return <UsersPage searchParams={searchParams} />;
}
