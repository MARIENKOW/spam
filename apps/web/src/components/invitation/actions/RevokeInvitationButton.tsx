"use client";

import BlockIcon from "@mui/icons-material/Block";
import { useTranslations } from "next-intl";
import { StyledTooltip } from "@/components/ui/StyledTooltip";
import { StyledIconButton } from "@/components/ui/StyledIconButton";
import { useConfirm } from "@/hooks/useConfirm";
import { AdminInvitationDto } from "@myorg/shared/dto";
import { useRevokeInvitation } from "@/hooks/tanstack/useInvitationMutations";

interface Props {
    invId: AdminInvitationDto["id"];
}

export function RevokeInvitationButton({ invId }: Props) {
    const t = useTranslations();
    const { confirm, confirmDialog } = useConfirm();
    const { mutate, isPending } = useRevokeInvitation();

    const handle = async () => {
        const ok = await confirm({
            title: t("pages.admin.invitation.actions.revoke") + "?",
        });
        if (!ok) return;
        mutate(invId);
    };

    return (
        <>
            {confirmDialog}
            <StyledTooltip
                title={t("pages.admin.invitation.actions.revoke")}
                placement="top"
            >
                <span>
                    <StyledIconButton
                        size="small"
                        onClick={handle}
                        loading={isPending}
                        color="warning"
                    >
                        <BlockIcon fontSize="small" />
                    </StyledIconButton>
                </span>
            </StyledTooltip>
        </>
    );
}
