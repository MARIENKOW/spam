"use client";

import { useConfirm } from "@/hooks/useConfirm";
import { useStopInvite } from "@/hooks/tanstack/useInviteMutations";
import { useInviteProgress } from "@/hooks/tanstack/useInvite";
import { InviteRecipientFeed } from "@/app/[locale]/(admin)/(dashboard)/(dashboard)/tg-accounts/[id]/invite/InviteRecipientFeed";
import { InviteDto } from "@myorg/shared/dto";
import {
    Avatar,
    Box,
    Chip,
    Divider,
    LinearProgress,
} from "@mui/material";
import StopIcon from "@mui/icons-material/Stop";
import { useTranslations } from "next-intl";
import { StyledButton } from "@/components/ui/StyledButton";
import { StyledTypography } from "@/components/ui/StyledTypography";

interface Props {
    accountId: string;
    invite: InviteDto;
}

export default function InviteRunningView({ accountId, invite }: Props) {
    const t = useTranslations();
    const { confirm, confirmDialog } = useConfirm();
    const { mutate: stop, isPending: isStopping } = useStopInvite(accountId);
    const { data: progress } = useInviteProgress(accountId, true);

    const current = progress ?? invite.progress;
    const sent = current.sent;
    const failed = current.failed;
    const pending = current.pending;
    const total = current.total;
    const progressValue = total > 0 ? Math.round(((sent + failed) / total) * 100) : 0;

    const targetTitle = current.targetChannelTitle ?? invite.targetChannelTitle;

    const handleStop = async () => {
        const ok = await confirm({
            title: t("pages.admin.tgAccounts.invite.actions.confirmStop"),
            description: t("pages.admin.tgAccounts.invite.actions.confirmStopBody"),
        });
        if (!ok) return;
        stop();
    };

    return (
        <Box display="flex" flexDirection="column" gap={3}>
            {confirmDialog}

            <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
                <Box>
                    <StyledTypography variant="h5" fontWeight={700} mb={0.5}>
                        {t("pages.admin.tgAccounts.invite.name")}
                    </StyledTypography>
                    <Chip
                        size="small"
                        label={t("pages.admin.tgAccounts.invite.status.RUNNING")}
                        color="warning"
                        variant="outlined"
                    />
                </Box>
                <StyledButton
                    variant="outlined"
                    color="error"
                    startIcon={<StopIcon />}
                    onClick={handleStop}
                    loading={isStopping}
                >
                    {t("pages.admin.tgAccounts.invite.actions.stop")}
                </StyledButton>
            </Box>

            {targetTitle && (
                <Box
                    display="flex"
                    alignItems="center"
                    gap={1.5}
                    p={2}
                    sx={{ borderRadius: 2, bgcolor: "action.hover" }}
                >
                    <Avatar sx={{ width: 36, height: 36, fontSize: 14, bgcolor: "primary.main" }}>
                        {targetTitle[0]}
                    </Avatar>
                    <Box>
                        <StyledTypography variant="caption" color="text.disabled" display="block">
                            {t("pages.admin.tgAccounts.invite.targetChannel.label")}
                        </StyledTypography>
                        <StyledTypography variant="body2" fontWeight={600}>
                            {targetTitle}
                        </StyledTypography>
                    </Box>
                </Box>
            )}

            <Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                    <StyledTypography variant="body2" color="text.secondary">
                        {sent + failed} / {total}
                    </StyledTypography>
                    <StyledTypography variant="body2" color="text.secondary">
                        {progressValue}%
                    </StyledTypography>
                </Box>
                <LinearProgress variant="determinate" value={progressValue} sx={{ height: 8, borderRadius: 4 }} />
            </Box>

            <Box>
                <StyledTypography variant="subtitle2" color="text.secondary" mb={1}>
                    {t("pages.admin.tgAccounts.invite.channels.title")}
                </StyledTypography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                    {current.channels.map((channel) => (
                        <Chip
                            key={channel.id}
                            avatar={
                                <Avatar src={channel.photoUrl ?? undefined} sx={{ fontSize: 12 }}>
                                    {channel.title[0]}
                                </Avatar>
                            }
                            label={channel.title}
                            variant="outlined"
                            size="small"
                        />
                    ))}
                </Box>
            </Box>

            <Divider />

            <Box>
                <StyledTypography variant="subtitle1" fontWeight={600} mb={2}>
                    {t("pages.admin.tgAccounts.invite.recipients.unique", { count: total })}
                </StyledTypography>
                <InviteRecipientFeed
                    accountId={accountId}
                    sent={sent}
                    failed={failed}
                    pending={pending}
                    isRunning
                />
            </Box>
        </Box>
    );
}
