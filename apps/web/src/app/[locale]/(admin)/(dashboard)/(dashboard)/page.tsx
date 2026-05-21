import BlogPage from "@/app/[locale]/(admin)/(dashboard)/(dashboard)/blog/BlogPage";
import { NAV_GROUPS } from "@/app/[locale]/(admin)/(dashboard)/(dashboard)/nav.config";
import TgAccountsPage from "@/app/[locale]/(admin)/(dashboard)/(dashboard)/tg-accounts/TgAccountsPage";
import AuthErrorElement from "@/components/feedback/error/AuthErrorElement";
import MobileNavigation from "@/components/layout/navigation/MobileNavigation";
import { getAdminAuth } from "@/utils/cache/admin.cache.me";
import { Box } from "@mui/material";

interface Props {
    searchParams: Promise<unknown>;
}

export default async function AdminHome({ searchParams }: Props) {
    const { admin } = await getAdminAuth();
    return (
        <>
            <Box
                flex={1}
                flexDirection={"column"}
                sx={{ display: { xs: "none", md: "flex" } }}
            >
                <TgAccountsPage searchParams={searchParams} />
            </Box>

            <Box
                flex={1}
                flexDirection={"column"}
                sx={{ display: { xs: "flex", md: "none" } }}
            >
                {admin ? (
                    <MobileNavigation config={NAV_GROUPS(admin.role)} />
                ) : (
                    <AuthErrorElement />
                )}
            </Box>
        </>
    );
}
