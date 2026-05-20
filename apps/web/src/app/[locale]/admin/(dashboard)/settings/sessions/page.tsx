import { SessionList } from "@/app/[locale]/admin/(dashboard)/settings/sessions/SessionList";
import BreadcrumbsComponent from "@/components/features/Breadcrumbs/BreadcrumbsComponent";
import ErrorHandlerElement from "@/components/feedback/error/ErrorHandlerElement";
import { ContainerComponent } from "@/components/ui/Container";
import { StyledPaper } from "@/components/ui/StyledPaper";
import { StyledTypography } from "@/components/ui/StyledTypography";
import SessionServiceAdmin from "@/services/auth/admin/session.service.admin";
import { $apiAdminServer } from "@/utils/api/admin/fetch.admin.server";
import { Box } from "@mui/material";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";
import { getTranslations } from "next-intl/server";
const session = new SessionServiceAdmin($apiAdminServer);

export default async function Page() {
    const t = await getTranslations();
    let data;
    let error: unknown;
    try {
        const body = await session.getMe();
        data = body.data;
    } catch (e) {
        error = e;
    }
    return (
        <ContainerComponent marging={false} maxWidth={false}>
            <Box mb={4} display={{ xs: "flex", md: "none" }}>
                <BreadcrumbsComponent
                    options={[
                        {
                            name: t("pages.admin.settings.name"),
                            href: FULL_PATH_ROUTE.admin.settings.path,
                            key: "sett",
                        },
                        {
                            name: t("pages.admin.settings.sessions.name"),
                            href: FULL_PATH_ROUTE.admin.settings.sessions.path,
                            key: "sett2",
                        },
                    ]}
                />
            </Box>
            <StyledTypography variant="h5" fontWeight={700} mb={0.5}>
                {t("pages.admin.settings.sessions.name")}
            </StyledTypography>
            {error ? (
                <ErrorHandlerElement error={error} />
            ) : (
                <SessionList sessions={data} />
            )}
        </ContainerComponent>
    );
}
