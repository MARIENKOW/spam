import { Box } from "@mui/material";
import MobileNavigation from "@/components/layout/navigation/MobileNavigation";
import ProfilePage from "@/app/[locale]/(dashboard)/profile/settings/ProfilePage";
import { NAV_GROUPS } from "@/app/[locale]/(dashboard)/profile/settings/nav.config";

export default async function Page() {
    return (
        <>
            <Box
                flexDirection={"column"}
                flex={1}
                sx={{ display: { xs: "none", md: "flex" } }}
            >
                <ProfilePage />
            </Box>

            <Box
                flexDirection={"column"}
                flex={1}
                sx={{ display: { xs: "flex", md: "none" } }}
            >
                <MobileNavigation
                    label="pages.profile.settings.name"
                    config={NAV_GROUPS}
                />
            </Box>
        </>
    );
}
