"use client";

import { StyledButton } from "@/components/ui/StyledButton";
import { snackbarSuccess } from "@/utils/snackbar/snackbar.success";
import { useRouter } from "@/i18n/navigation";
import AuthUserService from "@/services/auth/user/auth.user.service";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { $apiClient } from "@/utils/api/fetch.client";
import { errorHandler } from "@/helpers/error/error.handler.helper";

const user = new AuthUserService($apiClient);

export default function ActivateButton({
    email,
    afterFetch,
}: {
    email: string;
    afterFetch?: () => void;
}) {
    const t = useTranslations();
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);
        try {
            const { data } = await user.sendActivate({ email });
            snackbarSuccess(data);
        } catch (error) {
            errorHandler({
                error,
                t,
            });
        } finally {
            if (afterFetch) afterFetch();
            setLoading(false);
        }
    };
    return (
        <StyledButton
            variant="outlined"
            loading={loading}
            onClick={handleClick}
        >
            {t("features.activate.name")}
        </StyledButton>
    );
}
