"use client";

import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { useTranslations } from "next-intl";
import { StyledTooltip } from "@/components/ui/StyledTooltip";
import { StyledIconButton } from "@/components/ui/StyledIconButton";
import { useConfirm } from "@/hooks/useConfirm";
import { UserManagementDto } from "@myorg/shared/dto";
import { useDeleteUser } from "@/hooks/tanstack/useUserMutations";

interface Props {
    userId: UserManagementDto["id"];
}

export function DeleteUserButton({ userId }: Props) {
    const t = useTranslations();
    const { confirm, confirmDialog } = useConfirm();
    const { mutate, isPending } = useDeleteUser();

    const handle = async () => {
        const ok = await confirm({ title: t("pages.admin.users.actions.delete") + "?" });
        if (!ok) return;
        mutate(userId);
    };

    return (
        <>
            {confirmDialog}
            <StyledTooltip title={t("pages.admin.users.actions.delete")} placement="top">
                <span>
                    <StyledIconButton size="small" color="error" onClick={handle} loading={isPending}>
                        <DeleteForeverIcon fontSize="small" />
                    </StyledIconButton>
                </span>
            </StyledTooltip>
        </>
    );
}
