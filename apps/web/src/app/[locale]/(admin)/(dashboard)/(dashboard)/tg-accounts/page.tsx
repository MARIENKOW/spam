import TgAccountsPage from "@/app/[locale]/(admin)/(dashboard)/(dashboard)/tg-accounts/TgAccountsPage";

interface Props {
    searchParams: Promise<unknown>;
}

export default async function Page({ searchParams }: Props) {
    return <TgAccountsPage searchParams={searchParams} />;
}
