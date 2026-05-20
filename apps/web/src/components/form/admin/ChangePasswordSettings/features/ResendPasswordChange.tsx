"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { useTranslations } from "next-intl";
import { StyledButton } from "@/components/ui/StyledButton";
import { errorHandler } from "@/helpers/error/error.handler.helper";
import {
    ApiErrorResponse,
    ErrorsWithMessages,
    MailSendSuccess,
} from "@myorg/shared/dto";
import { useCountdown } from "@/hooks/useCountdown";
import ChangePasswordAdminService from "@/services/admin/changePassword.admin.service";
import { $apiAdminClient } from "@/utils/api/admin/fetch.admin.client";

interface Props {
    cooldownUntil: string | null;
    onCancel: () => void;
    setMailSendSuccess: Dispatch<SetStateAction<MailSendSuccess>>;
}

const { resend } = new ChangePasswordAdminService($apiAdminClient);

export default function ResendPasswordChange({
    cooldownUntil: initialCooldownUntil,
    onCancel,
    setMailSendSuccess,
}: Props) {
    const t = useTranslations();
    const [cooldownUntil, setCooldownUntil] = useState<string | null>(
        initialCooldownUntil,
    );
    const [resending, setResending] = useState<boolean>(false);
    const { remaining, label } = useCountdown(cooldownUntil);

    const handleClick = async () => {
        setResending(true);
        try {
            const body = await resend();
            setMailSendSuccess(body.data);
            setCooldownUntil(body.data.cooldownUntil);
            setResending(false);
        } catch (error) {
            errorHandler({
                error,
                t,
                fallback: {
                    notfound: { callback: onCancel },
                    validation: {
                        callback() {
                            const { data } = error as ApiErrorResponse;
                            const { root } = data as ErrorsWithMessages;
                            if (root?.[0]?.data?.return) onCancel();
                        },
                    },
                },
            });
            setResending(false);
        } finally {
        }
    };

    return (
        <StyledButton
            variant="text"
            size="small"
            disabled={remaining > 0}
            onClick={handleClick}
            loading={resending}
        >
            {remaining > 0
                ? t("features.changePassword.resend.cooldown", {
                      time: label,
                  })
                : t("features.changePassword.resend.name")}
        </StyledButton>
    );
}
