"use server";

import NavigationAdmin from "@/components/features/auth/admin/Navigation.admin";
import SkeletonAuthHeader from "@/components/skeletons/auth/SkeletonAuthHeader";
import { StyledButton } from "@/components/ui/StyledButton";
import { Link } from "@/i18n/navigation";
import { getAdminAuth } from "@/utils/cache/admin.cache.me";
import { Box } from "@mui/material";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";

import { getTranslations } from "next-intl/server";

export default async function AuthNavigationAdmin() {
    const { admin, error } = await getAdminAuth();
    const t = await getTranslations();
    if (error) return <SkeletonAuthHeader />;
    if (!!admin) return <NavigationAdmin />;

    return (
        <Box display={"flex"} gap={1}>
            <Link href={FULL_PATH_ROUTE.admin.login.path}>
                <StyledButton variant="contained">
                    {t("pages.admin.login.name")}
                </StyledButton>
            </Link>
        </Box>
    );
}
