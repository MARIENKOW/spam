"use client";

import { useConfirm } from "@/hooks/useConfirm";
import { useResetBroadcast } from "@/hooks/tanstack/useBroadcastMutations";
import { RecipientFeed } from "@/app/[locale]/(admin)/(dashboard)/(dashboard)/tg-accounts/[id]/broadcast/RecipientFeed";
import { BroadcastDto } from "@myorg/shared/dto";
import {
    Box,
    Chip,
    Divider,
    Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SendIcon from "@mui/icons-material/Send";
import ErrorIcon from "@mui/icons-material/Error";
import { useTranslations } from "next-intl";
import { StyledButton } from "@/components/ui/StyledButton";
import { StyledTypography } from "@/components/ui/StyledTypography";

interface Props {
    accountId: string;
    broadcast: BroadcastDto;
}

export default function BroadcastCompletedView({ accountId, broadcast }: Props) {
    const t = useTranslations();
    const { confirm, confirmDialog } = useConfirm();
    const isCompleted = broadcast.status === "COMPLETED";
    const { mutate: reset, isPending: isResetting } = useResetBroadcast(accountId);

    const progress = broadcast.progress;

    const handleReset = async () => {
        const ok = await confirm({ title: t("pages.admin.tgAccounts.broadcast.actions.new") + "?" });
        if (!ok) return;
        reset();
    };

    return (
        <Box display="flex" flexDirection="column" gap={3}>
            {confirmDialog}

            <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
                <Box>
                    <StyledTypography variant="h5" fontWeight={700} mb={0.5}>
                        {isCompleted
                            ? t("pages.admin.tgAccounts.broadcast.summary.title")
                            : t("pages.admin.tgAccounts.broadcast.summary.stoppedTitle")}
                    </StyledTypography>
                    <Chip
                        size="small"
                        label={t(`pages.admin.tgAccounts.broadcast.status.${broadcast.status}`)}
                        color={isCompleted ? "success" : "default"}
                        variant="outlined"
                    />
                </Box>
                <StyledButton
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleReset}
                    loading={isResetting}
                >
                    {t("pages.admin.tgAccounts.broadcast.actions.new")}
                </StyledButton>
            </Box>

            <Box display="flex" flexWrap="wrap" gap={2}>
                <Box
                    sx={{
                        flex: "1 1 100px",
                        p: 2,
                        borderRadius: 2,
                        bgcolor: "success.main",
                        color: "success.contrastText",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 0.5,
                    }}
                >
                    <SendIcon />
                    <Typography variant="h5" fontWeight={700}>{progress.sent}</Typography>
                    <Typography variant="caption">{t("pages.admin.tgAccounts.broadcast.summary.sent")}</Typography>
                </Box>
                <Box
                    sx={{
                        flex: "1 1 100px",
                        p: 2,
                        borderRadius: 2,
                        bgcolor: progress.failed > 0 ? "error.main" : "action.selected",
                        color: progress.failed > 0 ? "error.contrastText" : "text.secondary",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 0.5,
                    }}
                >
                    <ErrorIcon />
                    <Typography variant="h5" fontWeight={700}>{progress.failed}</Typography>
                    <Typography variant="caption">{t("pages.admin.tgAccounts.broadcast.summary.failed")}</Typography>
                </Box>
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
                    {t("pages.admin.tgAccounts.broadcast.summary.messageCopy")}
                </StyledTypography>
                <StyledTypography variant="body2">{progress.message}</StyledTypography>
            </Box>

            <Divider />

            <Box>
                <StyledTypography variant="subtitle1" fontWeight={600} mb={2}>
                    {t("pages.admin.tgAccounts.broadcast.recipients.listTitle")}
                </StyledTypography>
                <RecipientFeed
                    accountId={accountId}
                    sent={progress.sent}
                    failed={progress.failed}
                    pending={progress.pending}
                    isRunning={false}
                />
            </Box>

        </Box>
    );
}
