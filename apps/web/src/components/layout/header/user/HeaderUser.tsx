import { LanguageChange } from "@/components/common/LanguageChange";
import ThemeChange from "@/components/common/ThemeChange";
import { ContainerComponent } from "@/components/ui/Container";
import { Link } from "@/i18n/navigation";
import { getThemeMode } from "@/theme/themeMode";
import { Box, Button, Toolbar } from "@mui/material";
import { getTranslations } from "next-intl/server";
import AuthNavigation from "@/components/features/auth/user/AuthNavigation.user";
import { FULL_PATH_ROUTE, ROUTE } from "@myorg/shared/route";
import { getUserAuth } from "@/utils/cache/user.cache.me";
import { AvailableMode } from "@/theme/theme";

export default async function HeaderUser() {
    const t = await getTranslations();
    const mode = await getThemeMode();
    // const { user } = await getUserAuth();

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
                    <Link href={FULL_PATH_ROUTE.path}>
                        <Button>{t("pages.main.name")}</Button>
                    </Link>
                    <Box alignItems={"center"} display={"flex"} gap={1}>
                        <ThemeChange serverMode={mode} />
                        <LanguageChange />
                        <AuthNavigation />
                    </Box>
                </Box>
            </ContainerComponent>
        </Box>
    );
}
