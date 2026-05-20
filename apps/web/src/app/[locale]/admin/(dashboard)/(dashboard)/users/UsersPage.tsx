import BreadcrumbsComponent from "@/components/features/Breadcrumbs/BreadcrumbsComponent";
import { ContainerComponent } from "@/components/ui/Container";
import { Box } from "@mui/material";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";
import { getTranslations } from "next-intl/server";
import * as uuid from "uuid";
import UsersComponent from "@/app/[locale]/admin/(dashboard)/(dashboard)/users/UsersComponent";
import { Hydrate } from "@/lib/tanstack/Hydrate";
import { getQueryClient } from "@/lib/tanstack/queryClient";
import { parseListParams } from "@/lib/tanstack/parseListParams";
import { defaultUserParams } from "@/lib/tanstack/listDefaults";
import UserManagementService from "@/services/admin/userManagement/userManagement.service";
import { $apiAdminServer } from "@/utils/api/admin/fetch.admin.server";
import { userKeys } from "@/lib/tanstack/keys";

const { getAll } = new UserManagementService($apiAdminServer);

export default async function UsersPage({ searchParams }: { searchParams: Promise<unknown> }) {
    const params = await searchParams;
    const parsed = parseListParams(params, defaultUserParams);
    const queryKey = userKeys.list(parsed);
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
                            name: t("pages.admin.users.name"),
                            href: FULL_PATH_ROUTE.admin.users.path,
                            key: uuid.v4(),
                        },
                    ]}
                />
            </Box>
            <Hydrate>
                <UsersComponent />
            </Hydrate>
        </ContainerComponent>
    );
}
