import BreadcrumbsComponent from "@/components/features/Breadcrumbs/BreadcrumbsComponent";
import { StyledTypography } from "@/components/ui/StyledTypography";
import { Box } from "@mui/material";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";
import { getTranslations } from "next-intl/server";
import ChangePasswordAdminService from "@/services/admin/changePassword.admin.service";
import ErrorHandlerElement from "@/components/feedback/error/ErrorHandlerElement";
import ChangePasswordSettings from "@/components/form/admin/ChangePasswordSettings";
import { $apiAdminServer } from "@/utils/api/admin/fetch.admin.server";
import { ContainerComponent } from "@/components/ui/Container";

const changePassword = new ChangePasswordAdminService($apiAdminServer);

export default async function Page() {
    const t = await getTranslations();
    let data;
    let error;
    try {
        const body = await changePassword.status();
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
                            name: t("pages.admin.settings.password.name"),
                            href: FULL_PATH_ROUTE.admin.settings.password.path,
                            key: "sett2",
                        },
                    ]}
                />
            </Box>
            <StyledTypography variant="h5" fontWeight={700} mb={0.5}>
                {t("pages.admin.settings.password.name")}
            </StyledTypography>
            <StyledTypography variant="body2" color="text.secondary" mb={4}>
                {t("pages.admin.settings.password.subtitle")}
            </StyledTypography>
            {error ? (
                <ErrorHandlerElement error={error} />
            ) : (
                data && (
                    <ChangePasswordSettings
                        initialMailSendSuccess={data?.pending}
                        withoutPassword={data?.withoutPassword}
                    />
                )
            )}
        </ContainerComponent>
    );
}
