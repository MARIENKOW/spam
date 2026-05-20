import BreadcrumbsComponent from "@/components/features/Breadcrumbs/BreadcrumbsComponent";
import BlogCreateForm from "@/components/form/BlogCreateForm";
import { ContainerComponent } from "@/components/ui/Container";
import { Box } from "@mui/material";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";
import { getTranslations } from "next-intl/server";
import * as uuid from "uuid";

export default async function Page() {
    const t = await getTranslations();
    return (
        <ContainerComponent>
            <Box mb={4}>
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
                        {
                            name: t("pages.admin.blog.create.name"),
                            href: FULL_PATH_ROUTE.admin.blog.create.path,
                            key: uuid.v4(),
                        },
                    ]}
                />
            </Box>
            <BlogCreateForm />
        </ContainerComponent>
    );
}
