"use client";
import { useState } from "react";
import { ButtonProps } from "@mui/material";
import { useTranslations } from "next-intl";
import { StyledButton } from "@/components/ui/StyledButton";
import { useConfirm } from "@/hooks/useConfirm";
import { errorHandler } from "@/helpers/error/error.handler.helper";
import { snackbarSuccess } from "@/utils/snackbar/snackbar.success";
import { useRouter } from "@/i18n/navigation";
import { FetchCustomReturn } from "@/utils/api";

interface RevokeSessionButtonProps extends ButtonProps {
    onRevoke: () => FetchCustomReturn<void>;
}

export const RevokeSessionButton = ({
    onRevoke,
    ...props
}: RevokeSessionButtonProps) => {
    const t = useTranslations();
    const { confirm, confirmDialog } = useConfirm();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleClick = async () => {
        setLoading(true);
        try {
            const isAllow = await confirm();
            if (!isAllow) return;
            await onRevoke();
            router.refresh();
            snackbarSuccess(t("components.sessionList.revokeSuccess"));
        } catch (error) {
            errorHandler({ error, t });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <StyledButton
                loading={loading}
                onClick={handleClick}
                size="small"
                color="error"
                {...props}
            >
                {t("components.sessionList.revokeSession")}
            </StyledButton>
            {confirmDialog}
        </>
    );
};
