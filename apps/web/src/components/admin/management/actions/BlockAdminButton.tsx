"use client";

import BlockIcon from "@mui/icons-material/Block";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { useTranslations } from "next-intl";
import { StyledTooltip } from "@/components/ui/StyledTooltip";
import { StyledIconButton } from "@/components/ui/StyledIconButton";
import { useConfirm } from "@/hooks/useConfirm";
import { AdminManagementDto } from "@myorg/shared/dto";
import { useBlockAdmin, useUnblockAdmin } from "@/hooks/tanstack/useAdminMutations";

interface Props {
    admin: AdminManagementDto;
}

export function BlockAdminButton({ admin }: Props) {
    const t = useTranslations();
    const { confirm, confirmDialog } = useConfirm();
    const { mutate: block, isPending: isBlocking } = useBlockAdmin();
    const { mutate: unblock, isPending: isUnblocking } = useUnblockAdmin();

    const isBlocked = admin.status === "BLOCKED";

    const handle = async () => {
        const key = isBlocked
            ? "pages.admin.admins.actions.unblock"
            : "pages.admin.admins.actions.block";
        const ok = await confirm({ title: t(key) + "?" });
        if (!ok) return;
        isBlocked ? unblock(admin.id) : block(admin.id);
    };

    return (
        <>
            {confirmDialog}
            <StyledTooltip
                title={t(
                    isBlocked
                        ? "pages.admin.admins.actions.unblock"
                        : "pages.admin.admins.actions.block",
                )}
                placement="top"
            >
                <span>
                    <StyledIconButton
                        size="small"
                        color={isBlocked ? "success" : "warning"}
                        onClick={handle}
                        loading={isBlocking || isUnblocking}
                    >
                        {isBlocked ? (
                            <LockOpenIcon fontSize="small" />
                        ) : (
                            <BlockIcon fontSize="small" />
                        )}
                    </StyledIconButton>
                </span>
            </StyledTooltip>
        </>
    );
}
