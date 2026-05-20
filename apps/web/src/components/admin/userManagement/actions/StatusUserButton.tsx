"use client";

import BlockIcon from "@mui/icons-material/Block";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import { useTranslations } from "next-intl";
import { StyledTooltip } from "@/components/ui/StyledTooltip";
import { StyledIconButton } from "@/components/ui/StyledIconButton";
import { useConfirm } from "@/hooks/useConfirm";
import { UserManagementDto } from "@myorg/shared/dto";
import { useBlockUser, useActivateUser } from "@/hooks/tanstack/useUserMutations";

interface Props {
    user: UserManagementDto;
}

export function StatusUserButton({ user }: Props) {
    const t = useTranslations();
    const { confirm, confirmDialog } = useConfirm();
    const { mutate: block, isPending: isBlocking } = useBlockUser();
    const { mutate: activate, isPending: isActivating } = useActivateUser();

    const isBlocked = user.status === "BLOCKED";
    const isActive = user.status === "ACTIVE";

    const handleBlock = async () => {
        const ok = await confirm({ title: t("pages.admin.users.actions.block") + "?" });
        if (!ok) return;
        block(user.id);
    };

    const handleActivate = async () => {
        const ok = await confirm({ title: t("pages.admin.users.actions.activate") + "?" });
        if (!ok) return;
        activate(user.id);
    };

    return (
        <>
            {confirmDialog}
            {!isActive && (
                <StyledTooltip title={t("pages.admin.users.actions.activate")} placement="top">
                    <span>
                        <StyledIconButton
                            size="small"
                            color="success"
                            onClick={handleActivate}
                            loading={isActivating}
                        >
                            {isBlocked ? <LockOpenIcon fontSize="small" /> : <HowToRegIcon fontSize="small" />}
                        </StyledIconButton>
                    </span>
                </StyledTooltip>
            )}
            {!isBlocked && (
                <StyledTooltip title={t("pages.admin.users.actions.block")} placement="top">
                    <span>
                        <StyledIconButton
                            size="small"
                            color="warning"
                            onClick={handleBlock}
                            loading={isBlocking}
                        >
                            <BlockIcon fontSize="small" />
                        </StyledIconButton>
                    </span>
                </StyledTooltip>
            )}
        </>
    );
}
