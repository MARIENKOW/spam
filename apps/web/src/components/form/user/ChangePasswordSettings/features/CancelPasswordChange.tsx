"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { StyledButton } from "@/components/ui/StyledButton";
import { errorHandler } from "@/helpers/error/error.handler.helper";
import ChangePasswordUserService from "@/services/user/changePassword.user.service";
import { $apiUserClient } from "@/utils/api/user/fetch.user.client";

interface Props {
    onCancel: () => void;
}

const { cancel } = new ChangePasswordUserService($apiUserClient);

export default function CancelPasswordChange({ onCancel }: Props) {
    const t = useTranslations();
    const [cancelling, setCancelling] = useState(false);

    const handleClick = async () => {
        setCancelling(true);
        try {
            await cancel();
            onCancel();
        } catch (error) {
            errorHandler({
                error,
                t,
                fallback: {
                    notfound: {
                        callback: onCancel,
                    },
                },
            });
        } finally {
            setCancelling(false);
        }
    };

    return (
        <StyledButton
            variant="outlined"
            color="error"
            size="small"
            onClick={handleClick}
            loading={cancelling}
        >
            {t("features.changePassword.cancel")}
        </StyledButton>
    );
}
