"use client";

import LockOpenIcon from "@mui/icons-material/LockOpen";
import { useTranslations } from "next-intl";
import { StyledTooltip } from "@/components/ui/StyledTooltip";
import { StyledIconButton } from "@/components/ui/StyledIconButton";
import { useConfirm } from "@/hooks/useConfirm";
import { AdminInvitationDto } from "@myorg/shared/dto";
import { useUnrevokeInvitation } from "@/hooks/tanstack/useInvitationMutations";

interface Props {
    invId: AdminInvitationDto["id"];
}

export function UnrevokeInvitationButton({ invId }: Props) {
    const t = useTranslations();
    const { confirm, confirmDialog } = useConfirm();
    const { mutate, isPending } = useUnrevokeInvitation();

    const handle = async () => {
        const ok = await confirm({
            title: t("pages.admin.invitation.actions.unrevoke") + "?",
        });
        if (!ok) return;
        mutate(invId);
    };

    return (
        <>
            {confirmDialog}
            <StyledTooltip
                title={t("pages.admin.invitation.actions.unrevoke")}
                placement="top"
            >
                <span>
                    <StyledIconButton
                        size="small"
                        onClick={handle}
                        loading={isPending}
                        color="success"
                    >
                        <LockOpenIcon fontSize="small" />
                    </StyledIconButton>
                </span>
            </StyledTooltip>
        </>
    );
}
