import BroadcastPageComponent from "@/app/[locale]/(admin)/(dashboard)/(dashboard)/tg-accounts/[id]/broadcast/BroadcastPageComponent";
import BreadcrumbsComponent from "@/components/features/Breadcrumbs/BreadcrumbsComponent";
import { ContainerComponent } from "@/components/ui/Container";
import { Hydrate } from "@/lib/tanstack/Hydrate";
import { Box } from "@mui/material";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";
import { getTranslations } from "next-intl/server";
import * as uuid from "uuid";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function BroadcastPage({ params }: Props) {
    const { id } = await params;
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
                            name: t("pages.admin.tgAccounts.name"),
                            href: FULL_PATH_ROUTE.admin.tgAccounts.path,
                            key: uuid.v4(),
                        },
                        {
                            name: t("pages.admin.tgAccounts.broadcast.name"),
                            href: `${FULL_PATH_ROUTE.admin.tgAccounts.path}/${id}/broadcast`,
                            key: uuid.v4(),
                        },
                    ]}
                />
            </Box>
            <Hydrate>
                <BroadcastPageComponent accountId={id} />
            </Hydrate>
        </ContainerComponent>
    );
}
