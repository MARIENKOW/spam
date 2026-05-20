import UserSignUpForm from "@/components/form/user/auth/UserRegisterForm";
import { ContainerComponent } from "@/components/ui/Container";
import { StyledTypography } from "@/components/ui/StyledTypography";
import { Link } from "@/i18n/navigation";
import { Box } from "@mui/material";
import { getTranslations } from "next-intl/server";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";

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
                        {t("pages.register.name")}
                    </StyledTypography>
                    <UserSignUpForm />
                    <Box
                        mt={2}
                        display={"flex"}
                        gap={1}
                        justifyContent={"center"}
                    >
                        <StyledTypography>
                            {t("pages.register.login")}
                        </StyledTypography>
                        <Link href={FULL_PATH_ROUTE.login.path}>
                            <Box alignItems={"center"} display={"inline-flex"}>
                                <StyledTypography color="primary">
                                    {t("pages.login.name")}
                                </StyledTypography>
                            </Box>
                        </Link>
                    </Box>
                </Box>
            </Box>
        </ContainerComponent>
    );
}
