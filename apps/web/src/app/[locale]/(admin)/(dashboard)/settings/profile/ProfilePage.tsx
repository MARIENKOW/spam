import BreadcrumbsComponent from "@/components/features/Breadcrumbs/BreadcrumbsComponent";
import AdminAvatarForm from "@/components/form/admin/AdminAvatarForm";
import { ContainerComponent } from "@/components/ui/Container";
import { StyledPaper } from "@/components/ui/StyledPaper";
import { StyledTypography } from "@/components/ui/StyledTypography";
import { Box } from "@mui/material";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";
import { getTranslations } from "next-intl/server";

const { path, profile } = FULL_PATH_ROUTE.admin.settings;

export default async function ProfilePage() {
    const t = await getTranslations();
    return (
        <ContainerComponent marging={false} maxWidth={false}>
            <Box mb={4} display={{ xs: "flex", md: "none" }}>
                <BreadcrumbsComponent
                    options={[
                        {
                            name: t("pages.admin.settings.name"),
                            href: path,
                            key: "sett",
                        },
                        {
                            name: t("pages.admin.settings.profile.name"),
                            href: profile.path,
                            key: "sett2",
                        },
                    ]}
                />
            </Box>
            <StyledTypography variant="h5" fontWeight={700} mb={0.5}>
                {t("pages.admin.settings.profile.name")}
            </StyledTypography>
            <Box
                display={"flex"}
                mt={2}
                justifyContent={{ xs: "center", md: "flex-start" }}
            >
                <AdminAvatarForm />
            </Box>
        </ContainerComponent>
    );
}
