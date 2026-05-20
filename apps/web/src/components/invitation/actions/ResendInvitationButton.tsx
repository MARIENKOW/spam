"use client";

import SendIcon from "@mui/icons-material/Send";
import { useTranslations } from "next-intl";
import { StyledTooltip } from "@/components/ui/StyledTooltip";
import { StyledIconButton } from "@/components/ui/StyledIconButton";
import { AdminInvitationDto } from "@myorg/shared/dto";
import { useResendInvitation } from "@/hooks/tanstack/useInvitationMutations";
import { useConfirm } from "@/hooks/useConfirm";

interface Props {
    invId: AdminInvitationDto["id"];
}

export function ResendInvitationButton({ invId }: Props) {
    const t = useTranslations();
    const { mutate, isPending } = useResendInvitation();
    const { confirm, confirmDialog } = useConfirm();

    const handle = async () => {
        const ok = await confirm({
            title: t("pages.admin.invitation.actions.resend") + "?",
        });
        if (!ok) return;
        mutate(invId);
    };

    return (
        <>
            {confirmDialog}
            <StyledTooltip
                title={t("pages.admin.invitation.actions.resend")}
                placement="top"
            >
                <span>
                    <StyledIconButton
                        size="small"
                        onClick={handle}
                        loading={isPending}
                        color="primary"
                    >
                        <SendIcon fontSize="small" />
                    </StyledIconButton>
                </span>
            </StyledTooltip>
        </>
    );
}
