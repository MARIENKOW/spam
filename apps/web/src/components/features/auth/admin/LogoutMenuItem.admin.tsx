"use client";

import { StyledButton } from "@/components/ui/StyledButton";
import { snackbarError } from "@/utils/snackbar/snackbar.error";
import { snackbarSuccess } from "@/utils/snackbar/snackbar.success";
import { useRouter } from "@/i18n/navigation";
import AuthAdminService from "@/services/auth/admin/auth.admin.service";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { $apiClient } from "@/utils/api/fetch.client";
import { errorHandler } from "@/helpers/error/error.handler.helper";
import { $apiAdminClient } from "@/utils/api/admin/fetch.admin.client";
import { StyledMenuItem } from "@/components/ui/StyledMenuItem";
import { CircularProgress, ListItemIcon, ListItemText } from "@mui/material";
import LoadingElement from "@/components/feedback/LoadingElement";
import LogoutIcon from "@mui/icons-material/Logout";
import { StyledListItemIcon } from "@/components/ui/StyledListItemIcon";
import { StyledListItemText } from "@/components/ui/StyledListItemText";

const admin = new AuthAdminService($apiAdminClient);

export default function LogoutMenuItemAdmin() {
    const t = useTranslations();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleClick = async () => {
        setLoading(true);
        try {
            await admin.logout();
            router.refresh();
            snackbarSuccess(t("features.logout.success"));
        } catch (error) {
            errorHandler({
                error,
                t,
                fallback: {
                    unknown: { message: [t("features.logout.error")] },
                    internal: { message: [t("features.logout.error")] },
                },
            });
        } finally {
            setLoading(false);
        }
    };
    return (
        <StyledMenuItem onClick={handleClick}>
            <StyledListItemIcon>
                {loading ? <CircularProgress size={15} /> : <LogoutIcon />}
            </StyledListItemIcon>
            <StyledListItemText>{t("features.logout.name")}</StyledListItemText>
        </StyledMenuItem>
    );
}
