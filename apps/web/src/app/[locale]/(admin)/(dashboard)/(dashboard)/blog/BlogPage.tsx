import BlogComponent from "@/app/[locale]/(admin)/(dashboard)/(dashboard)/blog/BlogComponent";
import BreadcrumbsComponent from "@/components/features/Breadcrumbs/BreadcrumbsComponent";
import { ContainerComponent } from "@/components/ui/Container";
import { Hydrate } from "@/lib/tanstack/Hydrate";
import { blogKeys } from "@/lib/tanstack/keys";
import { defaultBlogParams } from "@/lib/tanstack/listDefaults";
import { parseListParams } from "@/lib/tanstack/parseListParams";
import { getQueryClient } from "@/lib/tanstack/queryClient";
import BlogService from "@/services/blog/blog.service";
import { $apiAdminServer } from "@/utils/api/admin/fetch.admin.server";
import { Box } from "@mui/material";
import { Suspense } from "react";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";
import { getTranslations } from "next-intl/server";
import * as uuid from "uuid";

const { getAll } = new BlogService($apiAdminServer);

interface Props {
    searchParams: Promise<unknown>;
}

export default async function BlogPage({ searchParams }: Props) {
    const params = await searchParams;
    const parsed = parseListParams(params, defaultBlogParams);
    const queryKey = blogKeys.list(parsed);
    const queryClient = getQueryClient();
    try {
        await queryClient.prefetchQuery({
            queryKey,
            queryFn: async () => (await getAll(parsed)).data,
        });
    } catch {}

    const t = await getTranslations();
    return (
        <ContainerComponent maxWidth={false} marging={false}>
            <Box mb={4} display={{ xs: "block", md: "none" }}>
                <BreadcrumbsComponent
                    options={[
                        {
                            name: t("pages.admin.name"),
                            href: FULL_PATH_ROUTE.admin.path,
                            key: uuid.v4(),
                        },
                        {
                            name: t("pages.admin.blog.name"),
                            href: FULL_PATH_ROUTE.admin.blog.path,
                            key: uuid.v4(),
                        },
                    ]}
                />
            </Box>
            <Hydrate>
                <BlogComponent />
            </Hydrate>
        </ContainerComponent>
    );
}
