import { ContainerComponent } from "@/components/ui/Container";
import { StyledTypography } from "@/components/ui/StyledTypography";
import { Link } from "@/i18n/navigation";
import { Box } from "@mui/material";
import {
    ADMIN_PUBLIC_FALLBACK_ROUTE,
    FULL_PATH_ROUTE,
} from "@myorg/shared/route";
import { getTranslations } from "next-intl/server";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import AdminLoginForm from "@/components/form/admin/auth/AdminLoginForm";

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
                        {t("pages.admin.login.name")}
                    </StyledTypography>
                    <AdminLoginForm
                        redirectTo={callback || ADMIN_PUBLIC_FALLBACK_ROUTE}
                    />
                    <Box
                        display={"flex"}
                        gap={2}
                        mt={2}
                        justifyContent={"center"}
                    >
                        <Link href={FULL_PATH_ROUTE.admin.forgotPasssword.path}>
                            <Box alignItems={"center"} display={"inline-flex"}>
                                <StyledTypography color="primary">
                                    {t("pages.admin.forgotPassword.name")}
                                </StyledTypography>
                            </Box>
                        </Link>
                    </Box>
                </Box>
            </Box>
        </ContainerComponent>
    );
}
