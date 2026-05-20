import { Box } from "@mui/material";
import MobileNavigation from "@/components/layout/navigation/MobileNavigation";
import { NAV_GROUPS } from "@/app/[locale]/admin/(dashboard)/settings/nav.config";
import ProfilePage from "@/app/[locale]/admin/(dashboard)/settings/profile/ProfilePage";
import { getTranslations } from "next-intl/server";

export default async function SettingsPage() {
    const t = await getTranslations();

    return (
        <>
            <Box
                flex={1}
                flexDirection={"column"}
                sx={{ display: { xs: "none", md: "flex" } }}
            >
                <ProfilePage />
            </Box>

            <Box
                flex={1}
                flexDirection={"column"}
                sx={{ display: { xs: "flex", md: "none" } }}
            >
                <MobileNavigation
                    label="pages.admin.settings.name"
                    config={NAV_GROUPS}
                />
            </Box>
        </>
    );
}
