"use client";

import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { useTranslations } from "next-intl";
import { StyledTooltip } from "@/components/ui/StyledTooltip";
import { StyledIconButton } from "@/components/ui/StyledIconButton";
import { useConfirm } from "@/hooks/useConfirm";
import { AdminInvitationDto } from "@myorg/shared/dto";
import { useDeleteInvitation } from "@/hooks/tanstack/useInvitationMutations";

interface Props {
    invId: AdminInvitationDto["id"];
}

export function DeleteInvitationButton({ invId }: Props) {
    const t = useTranslations();
    const { confirm, confirmDialog } = useConfirm();
    const { mutate, isPending } = useDeleteInvitation();

    const handle = async () => {
        const ok = await confirm({
            title: t("pages.admin.invitation.actions.delete") + "?",
        });
        if (!ok) return;
        mutate(invId);
    };

    return (
        <>
            {confirmDialog}
            <StyledTooltip
                title={t("pages.admin.invitation.actions.delete")}
                placement="top"
            >
                <span>
                    <StyledIconButton
                        size="small"
                        onClick={handle}
                        loading={isPending}
                        color="error"
                    >
                        <DeleteForeverIcon fontSize="small" />
                    </StyledIconButton>
                </span>
            </StyledTooltip>
        </>
    );
}
