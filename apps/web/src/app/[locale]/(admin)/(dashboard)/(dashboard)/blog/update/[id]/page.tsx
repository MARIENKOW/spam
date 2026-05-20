import RedirectWithMessage from "@/components/common/RedirectWithMessage";
import BreadcrumbsComponent from "@/components/features/Breadcrumbs/BreadcrumbsComponent";
import ErrorHandlerElement from "@/components/feedback/error/ErrorHandlerElement";
import BlogUpdateForm from "@/components/form/BlogUpdateForm";
import { ContainerComponent } from "@/components/ui/Container";
import BlogService from "@/services/blog/blog.service";
import { $apiAdminServer } from "@/utils/api/admin/fetch.admin.server";
import { Box } from "@mui/material";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";
import { getTranslations } from "next-intl/server";
import * as uuid from "uuid";

const { get } = new BlogService($apiAdminServer);

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const t = await getTranslations();

    let data;
    let error;
    try {
        const body = await get(id);
        data = body.data;
    } catch (e) {
        error = e || true;
    }

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
                            name: t("common.update"),
                            href: FULL_PATH_ROUTE.admin.blog.update.path,
                            key: uuid.v4(),
                        },
                    ]}
                />
            </Box>
            {error ? (
                <ErrorHandlerElement
                    error={error}
                    fallback={{
                        notfound: {
                            element: (
                                <RedirectWithMessage
                                    path={FULL_PATH_ROUTE.admin.blog.path}
                                    type="error"
                                    message={t("api.NOT_FOUND")}
                                />
                            ),
                        },
                    }}
                />
            ) : (
                <BlogUpdateForm id={id} initialData={data!} />
            )}
        </ContainerComponent>
    );
}
