"use client";

import { useTranslations } from "next-intl";
import { StyledButton } from "@/components/ui/StyledButton";
import { useConfirm } from "@/hooks/useConfirm";
import { useDeleteAdminSession } from "@/hooks/tanstack/useAdminMutations";
import { ButtonProps } from "@mui/material";

interface Props extends ButtonProps {
    sessionId: string;
    adminId: string;
}

export function DeleteAdminSessionButton({ sessionId, adminId, ...props }: Props) {
    const t = useTranslations();
    const { confirm, confirmDialog } = useConfirm();
    const { mutate, isPending } = useDeleteAdminSession(adminId);

    const handle = async () => {
        const ok = await confirm({
            title: t("pages.admin.admins.actions.deleteSession") + "?",
        });
        if (!ok) return;
        mutate(sessionId);
    };

    return (
        <>
            {confirmDialog}
            <StyledButton
                size="small"
                color="error"
                loading={isPending}
                onClick={handle}
                {...props}
            >
                {t("pages.admin.admins.actions.deleteSession")}
            </StyledButton>
        </>
    );
}
