import { NAV_GROUPS } from "@/app/[locale]/(admin)/(dashboard)/(dashboard)/nav.config";
import Sidebar from "@/components/layout/navigation/Sidebar";
import SkeletonAuthSidebar from "@/components/skeletons/auth/SkeletonAuthSidebar";
import AdminPrivateWrapper from "@/components/wrappers/auth/AdminPrivateWrapper";
import { getAdminAuth } from "@/utils/cache/admin.cache.me";
import { Box } from "@mui/material";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";

export default async function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { admin } = await getAdminAuth();
    return (
        <AdminPrivateWrapper>
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
                    {admin ? (
                        <Sidebar
                            hidePaths={{
                                strict: [
                                    FULL_PATH_ROUTE.admin.blog.create.path,
                                ],
                                safe: [FULL_PATH_ROUTE.admin.blog.update.path],
                            }}
                            config={NAV_GROUPS(admin.role)}
                        />
                    ) : (
                        <SkeletonAuthSidebar />
                    )}
                </Box>
                <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    {children}
                </Box>
            </Box>
        </AdminPrivateWrapper>
    );
}
