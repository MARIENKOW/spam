"use server";

import UserNavigation from "@/components/features/auth/user/Navigation.user";
import SkeletonAuthHeader from "@/components/skeletons/auth/SkeletonAuthHeader";
import { StyledButton } from "@/components/ui/StyledButton";
import { Link } from "@/i18n/navigation";
import { getUserAuth } from "@/utils/cache/user.cache.me";
import { Box } from "@mui/material";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";

import { getTranslations } from "next-intl/server";

export default async function AuthNavigation() {
    const { user, error } = await getUserAuth();
    const t = await getTranslations();
    if (error) return <SkeletonAuthHeader />;
    if (!!user) return <UserNavigation />;

    return (
        <Box display={"flex"} gap={1}>
            <Link href={FULL_PATH_ROUTE.login.path}>
                <StyledButton variant="contained">
                    {t("pages.login.name")}
                </StyledButton>
            </Link>
        </Box>
    );
}
