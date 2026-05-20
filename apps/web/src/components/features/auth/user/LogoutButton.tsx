"use client";

import { StyledButton } from "@/components/ui/StyledButton";
import { snackbarError } from "@/utils/snackbar/snackbar.error";
import { snackbarSuccess } from "@/utils/snackbar/snackbar.success";
import { useRouter } from "@/i18n/navigation";
import AuthUserService from "@/services/auth/user/auth.user.service";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { errorHandler } from "@/helpers/error/error.handler.helper";
import { $apiUserClient } from "@/utils/api/user/fetch.user.client";

const user = new AuthUserService($apiUserClient);

export default function LogoutButton() {
    const t = useTranslations();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleClick = async () => {
        setLoading(true);
        try {
            await user.logout();
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
        <StyledButton loading={loading} onClick={handleClick}>
            {t("features.logout.name")}
        </StyledButton>
    );
}
