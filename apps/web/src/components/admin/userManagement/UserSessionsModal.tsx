"use client";

import { Box, CircularProgress, DialogContent, DialogTitle, Divider, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import { useTranslations } from "next-intl";
import { StyledDialog } from "@/components/ui/StyledDialog";
import { StyledTypography } from "@/components/ui/StyledTypography";
import { StyledTooltip } from "@/components/ui/StyledTooltip";
import { StyledIconButton } from "@/components/ui/StyledIconButton";
import { useConfirm } from "@/hooks/useConfirm";
import { useUserSessions, useDeleteAllUserSessions } from "@/hooks/tanstack/useUserMutations";
import { SessionCard } from "@/components/common/session/SessionCard";
import { DeleteUserSessionButton } from "@/components/admin/userManagement/actions/DeleteUserSessionButton";
import { UserManagementDto } from "@myorg/shared/dto";
import { useEffect } from "react";
import EmptyElement from "@/components/feedback/EmptyElement";

interface Props {
    user: UserManagementDto;
    open: boolean;
    onClose: () => void;
}

export function UserSessionsModal({ user, open, onClose }: Props) {
    const t = useTranslations();
    const { confirm, confirmDialog } = useConfirm();
    const { data: sessions, isFetching, refetch } = useUserSessions(user.id);
    const { mutate: deleteAll, isPending: isDeletingAll } = useDeleteAllUserSessions(user.id);

    useEffect(() => {
        if (open) refetch();
    }, [open, refetch]);

    const handleDeleteAll = async () => {
        if (!sessions?.length) return;
        const ok = await confirm({ title: t("pages.admin.users.actions.deleteAllSessions") + "?" });
        if (!ok) return;
        deleteAll();
    };

    return (
        <>
            {confirmDialog}
            <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
                    <Box>
                        <StyledTypography variant="h6" fontWeight={700}>
                            {t("pages.admin.users.sessions.title")}
                        </StyledTypography>
                        <StyledTypography variant="caption" color="text.secondary">
                            {user.email}
                        </StyledTypography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={0.5}>
                        {sessions && sessions.length > 0 && (
                            <StyledTooltip title={t("pages.admin.users.sessions.deleteAll")} placement="top">
                                <span>
                                    <StyledIconButton onClick={handleDeleteAll} loading={isDeletingAll} color="error" size="small">
                                        <DeleteSweepIcon />
                                    </StyledIconButton>
                                </span>
                            </StyledTooltip>
                        )}
                        <StyledIconButton size="small" onClick={onClose}>
                            <CloseIcon fontSize="small" />
                        </StyledIconButton>
                    </Box>
                </DialogTitle>
                <Divider />
                <DialogContent sx={{ p: 2 }}>
                    {(isFetching || !sessions) && (
                        <Box display="flex" justifyContent="center" py={4}>
                            <CircularProgress size={32} />
                        </Box>
                    )}
                    {!isFetching && sessions && sessions.length === 0 && (
                        <Box py={4}><EmptyElement /></Box>
                    )}
                    {!isFetching && sessions && sessions.length > 0 && (
                        <Box display="flex" flexDirection="column" gap={1.5}>
                            {sessions.map((session) => (
                                <SessionCard
                                    key={session.id}
                                    session={session}
                                    action={
                                        <>
                                            <DeleteUserSessionButton
                                                sessionId={session.id}
                                                userId={user.id}
                                                fullWidth
                                                variant="outlined"
                                                sx={{ display: { xs: "flex", sm: "none" } }}
                                            />
                                            <DeleteUserSessionButton
                                                sessionId={session.id}
                                                userId={user.id}
                                                variant="text"
                                                sx={{ display: { xs: "none", sm: "flex" } }}
                                            />
                                        </>
                                    }
                                />
                            ))}
                        </Box>
                    )}
                </DialogContent>
            </StyledDialog>
        </>
    );
}
