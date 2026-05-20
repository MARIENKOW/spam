import BreadcrumbsComponent from "@/components/features/Breadcrumbs/BreadcrumbsComponent";
import UserAvatarForm from "@/components/form/user/UserAvatarForm";
import { ContainerComponent } from "@/components/ui/Container";
import { StyledTypography } from "@/components/ui/StyledTypography";
import { Box } from "@mui/material";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";
import { getTranslations } from "next-intl/server";

export default async function ProfilePage() {
    const t = await getTranslations();
    return (
        <ContainerComponent maxWidth={false} marging={false}>
            <Box mb={4} display={{ xs: "flex", md: "none" }}>
                <BreadcrumbsComponent
                    options={[
                        {
                            name: t("pages.profile.settings.name"),
                            href: FULL_PATH_ROUTE.profile.settings.path,
                            key: "sett",
                        },
                        {
                            name: t("pages.profile.settings.profile.name"),
                            href: FULL_PATH_ROUTE.profile.settings.profile.path,
                            key: "sett2",
                        },
                    ]}
                />
            </Box>
            <StyledTypography variant="h5" fontWeight={700} mb={0.5}>
                {t("pages.profile.settings.profile.name")}
            </StyledTypography>
            <Box
                display={"flex"}
                mt={2}
                justifyContent={{ xs: "center", sm: "flex-start" }}
            >
                <UserAvatarForm />
            </Box>
        </ContainerComponent>
    );
}
