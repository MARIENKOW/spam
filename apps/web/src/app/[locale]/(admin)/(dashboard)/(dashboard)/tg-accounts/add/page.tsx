import BreadcrumbsComponent from "@/components/features/Breadcrumbs/BreadcrumbsComponent";
import TgAccountAddForm from "@/components/form/TgAccountAddForm";
import { ContainerComponent } from "@/components/ui/Container";
import { Box } from "@mui/material";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";
import { getTranslations } from "next-intl/server";
import * as uuid from "uuid";

export default async function Page() {
    const t = await getTranslations();
    return (
        <ContainerComponent marging={false} maxWidth={false}>
            <Box mb={4}>
                <BreadcrumbsComponent
                    options={[
                        {
                            name: t("pages.admin.name"),
                            href: FULL_PATH_ROUTE.admin.path,
                            key: uuid.v4(),
                        },
                        {
                            name: t("pages.admin.tgAccounts.name"),
                            href: FULL_PATH_ROUTE.admin.tgAccounts.path,
                            key: uuid.v4(),
                        },
                        {
                            name: t("pages.admin.tgAccounts.add.name"),
                            href: FULL_PATH_ROUTE.admin.tgAccounts.add.path,
                            key: uuid.v4(),
                        },
                    ]}
                />
            </Box>
            <TgAccountAddForm />
        </ContainerComponent>
    );
}
