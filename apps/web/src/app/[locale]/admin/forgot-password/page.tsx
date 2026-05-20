import AdminRememberPasswordForm from "@/components/form/admin/auth/AdminRememberPasswordForm";
import { ContainerComponent } from "@/components/ui/Container";
import { StyledTypography } from "@/components/ui/StyledTypography";
import { Link } from "@/i18n/navigation";
import { Box } from "@mui/material";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";
import { getTranslations } from "next-intl/server";

export default async function Page() {
    const t = await getTranslations();

    return (
        <ContainerComponent>
            <Box
                display={"flex"}
                alignItems={"center"}
                justifyContent={"center"}
                flex={1}
            >
                <Box
                    flex={"0 1 350px"}
                    display={"flex"}
                    flexDirection={"column"}
                >
                    <StyledTypography
                        fontWeight={600}
                        color={"primary"}
                        sx={{ textAlign: "center", mb: 3 }}
                        variant="h6"
                    >
                        {t("pages.admin.forgotPassword.name")}
                    </StyledTypography>
                    <AdminRememberPasswordForm />
                    <Box
                        mt={2}
                        display={"flex"}
                        gap={2}
                        justifyContent={"center"}
                    >
                        <Link href={FULL_PATH_ROUTE.admin.login.path}>
                            <Box alignItems={"center"} display={"inline-flex"}>
                                <StyledTypography color="primary">
                                    {t("pages.admin.forgotPassword.login")}
                                </StyledTypography>
                            </Box>
                        </Link>
                    </Box>
                </Box>
            </Box>
        </ContainerComponent>
    );
}
