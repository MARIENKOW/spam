import { NAV_GROUPS } from "@/app/[locale]/(dashboard)/profile/settings/nav.config";
import Sidebar from "@/components/layout/navigation/Sidebar";
import { Box } from "@mui/material";

export default async function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Box
            sx={{
                display: "flex",
                flex: 1,
            }}
        >
            <Box
                sx={{
                    display: { xs: "none", md: "flex" },
                    borderRight: "1px solid",
                    borderColor: "divider",
                }}
            >
                <Sidebar
                    label="pages.profile.settings.name"
                    config={NAV_GROUPS}
                />
            </Box>
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {children}
            </Box>
        </Box>
    );
}
