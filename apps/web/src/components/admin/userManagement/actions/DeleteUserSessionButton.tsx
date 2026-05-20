"use client";

import { useTranslations } from "next-intl";
import { StyledButton } from "@/components/ui/StyledButton";
import { useConfirm } from "@/hooks/useConfirm";
import { useDeleteUserSession } from "@/hooks/tanstack/useUserMutations";
import { ButtonProps } from "@mui/material";

interface Props extends ButtonProps {
    sessionId: string;
    userId: string;
}

export function DeleteUserSessionButton({ sessionId, userId, ...props }: Props) {
    const t = useTranslations();
    const { confirm, confirmDialog } = useConfirm();
    const { mutate, isPending } = useDeleteUserSession(userId);

    const handle = async () => {
        const ok = await confirm({ title: t("pages.admin.users.actions.deleteSession") + "?" });
        if (!ok) return;
        mutate(sessionId);
    };

    return (
        <>
            {confirmDialog}
            <StyledButton size="small" color="error" loading={isPending} onClick={handle} {...props}>
                {t("pages.admin.users.actions.deleteSession")}
            </StyledButton>
        </>
    );
}
