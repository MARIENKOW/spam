import UserLoginForm from "@/components/form/user/auth/UserLoginForm";
import { ContainerComponent } from "@/components/ui/Container";
import { StyledTypography } from "@/components/ui/StyledTypography";
import { Link } from "@/i18n/navigation";
import { Box, Typography } from "@mui/material";
import {
    FULL_PATH_ROUTE,
    USER_PUBLIC_FALLBACK_ROUTE,
} from "@myorg/shared/route";
import { getTranslations } from "next-intl/server";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<any>;
}) {
    const { callback } = await searchParams;
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
                        {t("pages.login.name")}
                    </StyledTypography>
                    <UserLoginForm
                        redirectTo={callback || USER_PUBLIC_FALLBACK_ROUTE}
                    />
                    <Box
                        display={"flex"}
                        gap={2}
                        mt={2}
                        justifyContent={"space-between"}
                    >
                        <Link href={FULL_PATH_ROUTE.forgotPasssword.path}>
                            <Box alignItems={"center"} display={"inline-flex"}>
                                <ArrowLeftIcon color="primary" />
                                <StyledTypography color="primary">
                                    {t("pages.forgotPassword.name")}
                                </StyledTypography>
                            </Box>
                        </Link>
                        <Link href={FULL_PATH_ROUTE.register.path}>
                            <Box alignItems={"center"} display={"inline-flex"}>
                                <StyledTypography color="primary">
                                    {t("pages.register.name")}
                                </StyledTypography>
                                <ArrowRightIcon color="primary" />
                            </Box>
                        </Link>
                    </Box>
                </Box>
            </Box>
        </ContainerComponent>
    );
}
