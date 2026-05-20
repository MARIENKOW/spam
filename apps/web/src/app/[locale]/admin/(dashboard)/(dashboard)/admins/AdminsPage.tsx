import BreadcrumbsComponent from "@/components/features/Breadcrumbs/BreadcrumbsComponent";
import { ContainerComponent } from "@/components/ui/Container";
import { Box } from "@mui/material";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";
import { getTranslations } from "next-intl/server";
import * as uuid from "uuid";
import AdminsComponent from "@/app/[locale]/admin/(dashboard)/(dashboard)/admins/AdminsComponent";
import { Hydrate } from "@/lib/tanstack/Hydrate";
import { getQueryClient } from "@/lib/tanstack/queryClient";
import { parseListParams } from "@/lib/tanstack/parseListParams";
import { defaultAdminParams } from "@/lib/tanstack/listDefaults";
import AdminManagementService from "@/services/admin/management/adminManagement.service";
import { $apiAdminServer } from "@/utils/api/admin/fetch.admin.server";
import { adminKeys } from "@/lib/tanstack/keys";

const { getAll } = new AdminManagementService($apiAdminServer);

export default async function AdminsPage({
    searchParams,
}: {
    searchParams: Promise<unknown>;
}) {
    const params = await searchParams;
    const parsed = parseListParams(params, defaultAdminParams);
    const queryKey = adminKeys.list(parsed);
    const queryClient = getQueryClient();
    try {
        await queryClient.prefetchQuery({
            queryKey,
            queryFn: async () => (await getAll(parsed)).data,
        });
    } catch (error) {}

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
                            name: t("pages.admin.admins.name"),
                            href: FULL_PATH_ROUTE.admin.admins.path,
                            key: uuid.v4(),
                        },
                    ]}
                />
            </Box>
            <Hydrate>
                <AdminsComponent />
            </Hydrate>
        </ContainerComponent>
    );
}
