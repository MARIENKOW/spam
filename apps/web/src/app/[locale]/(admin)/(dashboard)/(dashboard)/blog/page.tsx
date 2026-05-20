import BlogPage from "@/app/[locale]/(admin)/(dashboard)/(dashboard)/blog/BlogPage";

interface Props {
    searchParams: Promise<unknown>;
}

export default async function Page({ searchParams }: Props) {
    return <BlogPage searchParams={searchParams} />;
}
