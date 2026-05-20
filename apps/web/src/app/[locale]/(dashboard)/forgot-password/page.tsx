import UserSignInForm from "@/components/form/user/auth/UserLoginForm";
import UserRememberPasswordForm from "@/components/form/user/auth/UserRememberPasswordForm";
import { ContainerComponent } from "@/components/ui/Container";
import { StyledTypography } from "@/components/ui/StyledTypography";
import { Link } from "@/i18n/navigation";
import { Box, Typography } from "@mui/material";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";
import { getTranslations } from "next-intl/server";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { StyledButton } from "@/components/ui/StyledButton";

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
                        {t("pages.forgotPassword.name")}
                    </StyledTypography>
                    <UserRememberPasswordForm />
                    <Box
                        mt={2}
                        display={"flex"}
                        gap={2}
                        justifyContent={"center"}
                    >
                        <Link href={FULL_PATH_ROUTE.login.path}>
                            <Box alignItems={"center"} display={"inline-flex"}>
                                <StyledTypography color="primary">
                                    {t("pages.forgotPassword.login")}
                                </StyledTypography>
                            </Box>
                        </Link>
                    </Box>
                </Box>
            </Box>
        </ContainerComponent>
    );
}
