"use client";

import { useConfirm } from "@/hooks/useConfirm";
import { useStopBroadcast } from "@/hooks/tanstack/useBroadcastMutations";
import { useBroadcastProgress } from "@/hooks/tanstack/useBroadcast";
import { RecipientFeed } from "@/app/[locale]/(admin)/(dashboard)/(dashboard)/tg-accounts/[id]/broadcast/RecipientFeed";
import { BroadcastDto } from "@myorg/shared/dto";
import {
    Avatar,
    Box,
    Chip,
    Divider,
    LinearProgress,
    Typography,
} from "@mui/material";
import StopIcon from "@mui/icons-material/Stop";
import { useTranslations } from "next-intl";
import { StyledButton } from "@/components/ui/StyledButton";
import { StyledTypography } from "@/components/ui/StyledTypography";

interface Props {
    accountId: string;
    broadcast: BroadcastDto;
}

export default function BroadcastRunningView({ accountId, broadcast }: Props) {
    const t = useTranslations();
    const { confirm, confirmDialog } = useConfirm();
    const { mutate: stop, isPending: isStopping } = useStopBroadcast(accountId);
    const { data: progress } = useBroadcastProgress(accountId, true);

    const current = progress ?? broadcast.progress;
    const sent = current.sent;
    const failed = current.failed;
    const pending = current.pending;
    const total = current.total;
    const progressValue = total > 0 ? Math.round((sent / total) * 100) : 0;

    const handleStop = async () => {
        const ok = await confirm({
            title: t("pages.admin.tgAccounts.broadcast.actions.confirmStop"),
            description: t("pages.admin.tgAccounts.broadcast.actions.confirmStopBody"),
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
                        {t("pages.admin.tgAccounts.broadcast.name")}
                    </StyledTypography>
                    <Chip
                        size="small"
                        label={t("pages.admin.tgAccounts.broadcast.status.RUNNING")}
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
                    {t("pages.admin.tgAccounts.broadcast.actions.stop")}
                </StyledButton>
            </Box>

            <Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                    <StyledTypography variant="body2" color="text.secondary">
                        {t("pages.admin.tgAccounts.broadcast.progress", { sent, total })}
                    </StyledTypography>
                    <StyledTypography variant="body2" color="text.secondary">
                        {progressValue}%
                    </StyledTypography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={progressValue}
                    sx={{ height: 8, borderRadius: 4 }}
                />
            </Box>

            <Box
                sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "action.hover",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                }}
            >
                <StyledTypography variant="caption" color="text.disabled" display="block" mb={0.5}>
                    {t("pages.admin.tgAccounts.broadcast.message.label")}
                </StyledTypography>
                <StyledTypography variant="body2">{current.message}</StyledTypography>
            </Box>

            <Box>
                <StyledTypography variant="subtitle2" color="text.secondary" mb={1}>
                    {t("pages.admin.tgAccounts.broadcast.channels.title")}
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
                    {t("pages.admin.tgAccounts.broadcast.recipients.listTitle")}
                </StyledTypography>
                <RecipientFeed
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
