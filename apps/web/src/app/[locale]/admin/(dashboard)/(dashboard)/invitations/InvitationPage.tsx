import BreadcrumbsComponent from "@/components/features/Breadcrumbs/BreadcrumbsComponent";
import { ContainerComponent } from "@/components/ui/Container";
import { Box } from "@mui/material";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";
import { getTranslations } from "next-intl/server";
import * as uuid from "uuid";
import InvitationComponent from "@/app/[locale]/admin/(dashboard)/(dashboard)/invitations/InvitationComponent";

export default async function InvitationPage({}: {}) {
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
                            name: t("pages.admin.invitation.name"),
                            href: FULL_PATH_ROUTE.admin.invitations.path,
                            key: uuid.v4(),
                        },
                    ]}
                />
            </Box>
            <InvitationComponent />
        </ContainerComponent>
    );
}
