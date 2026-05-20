"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { useTranslations } from "next-intl";
import { StyledButton } from "@/components/ui/StyledButton";
import { errorHandler } from "@/helpers/error/error.handler.helper";
import { ApiErrorResponse, ErrorsWithMessages, MailSendSuccess } from "@myorg/shared/dto";
import { useCountdown } from "@/hooks/useCountdown";
import ChangePasswordUserService from "@/services/user/changePassword.user.service";
import { $apiUserClient } from "@/utils/api/user/fetch.user.client";

interface Props {
    cooldownUntil: string | null;
    onCancel: () => void;
    setMailSendSuccess: Dispatch<SetStateAction<MailSendSuccess>>;
}

const { resend } = new ChangePasswordUserService($apiUserClient);

export default function ResendPasswordChange({ cooldownUntil: initialCooldownUntil, onCancel, setMailSendSuccess }: Props) {
    const t = useTranslations();
    const [cooldownUntil, setCooldownUntil] = useState(initialCooldownUntil);
    const [resending, setResending] = useState(false);
    const { remaining, label } = useCountdown(cooldownUntil);

    const handleClick = async () => {
        setResending(true);
        try {
            const body = await resend();
            setMailSendSuccess(body.data);
            setCooldownUntil(body.data.cooldownUntil);
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
        } finally {
            setResending(false);
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
                ? t("features.changePassword.resend.cooldown", { time: label })
                : t("features.changePassword.resend.name")}
        </StyledButton>
    );
}
