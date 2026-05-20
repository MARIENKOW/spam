"use client";

import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { useTranslations } from "next-intl";
import { StyledTooltip } from "@/components/ui/StyledTooltip";
import { StyledIconButton } from "@/components/ui/StyledIconButton";
import { useConfirm } from "@/hooks/useConfirm";
import { AdminManagementDto } from "@myorg/shared/dto";
import { useDeleteAdmin } from "@/hooks/tanstack/useAdminMutations";

interface Props {
    adminId: AdminManagementDto["id"];
}

export function DeleteAdminButton({ adminId }: Props) {
    const t = useTranslations();
    const { confirm, confirmDialog } = useConfirm();
    const { mutate, isPending } = useDeleteAdmin();

    const handle = async () => {
        const ok = await confirm({
            title: t("pages.admin.admins.actions.delete") + "?",
        });
        if (!ok) return;
        mutate(adminId);
    };

    return (
        <>
            {confirmDialog}
            <StyledTooltip
                title={t("pages.admin.admins.actions.delete")}
                placement="top"
            >
                <span>
                    <StyledIconButton
                        size="small"
                        color="error"
                        onClick={handle}
                        loading={isPending}
                    >
                        <DeleteForeverIcon fontSize="small" />
                    </StyledIconButton>
                </span>
            </StyledTooltip>
        </>
    );
}
