import { LanguageChange } from "@/components/common/LanguageChange";
import ThemeChange from "@/components/common/ThemeChange";
import { ContainerComponent } from "@/components/ui/Container";
import { Link } from "@/i18n/navigation";
import { getThemeMode } from "@/theme/themeMode";
import { Box, Button, Toolbar } from "@mui/material";
import { getTranslations } from "next-intl/server";
import { FULL_PATH_ROUTE, ROUTE } from "@myorg/shared/route";
import AuthNavigationAdmin from "@/components/features/auth/admin/AuthNavigation.admin";
import { getAdminAuth } from "@/utils/cache/admin.cache.me";

export default async function HeaderAdmin() {
    const t = await getTranslations();
    const mode = await getThemeMode();
    const { admin } = await getAdminAuth();

    return (
        <Box
            borderBottom={"1px solid"}
            borderColor={"divider"}
            //  position={"fixed"} top={0} left={0}
            //   width={"100%"} zIndex={1000}
        >
            <ContainerComponent py={false}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 1,
                        pt: 1,
                        pb: 1,
                    }}
                >
                    {admin ? (
                        <Link href={FULL_PATH_ROUTE.admin.path}>
                            <Button>{t("pages.admin.name")}</Button>
                        </Link>
                    ) : (
                        <Box />
                    )}
                    <Box alignItems={"center"} display={"flex"} gap={1}>
                        <ThemeChange serverMode={mode} />
                        <LanguageChange />
                        <AuthNavigationAdmin />
                    </Box>
                </Box>
            </ContainerComponent>
        </Box>
    );
}
