"use client";

import { useTgAccountDetail, useOwnedChannels, useSyncOwnedChannels } from "@/hooks/tanstack/useTgAccountDetail";
import { useInviteHistory } from "@/hooks/tanstack/useInvite";
import { useDeleteAllInviteRuns, useDeleteInviteRun } from "@/hooks/tanstack/useInviteMutations";
import { useConfirm } from "@/hooks/useConfirm";
import {
    Avatar,
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    IconButton,
    LinearProgress,
    Tooltip,
    Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import StarIcon from "@mui/icons-material/Star";
import GroupIcon from "@mui/icons-material/Group";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import AddIcon from "@mui/icons-material/Add";
import HistoryIcon from "@mui/icons-material/History";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import StopIcon from "@mui/icons-material/Stop";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ErrorHandlerElement from "@/components/feedback/error/ErrorHandlerElement";
import { StyledTypography } from "@/components/ui/StyledTypography";
import { StyledButton } from "@/components/ui/StyledButton";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";
import { ClientDate } from "@/components/common/ClientDate";
import { relativeTime, formatDuration } from "@myorg/shared/utils";
import { useLocale } from "next-intl";
import { InviteRunDto } from "@myorg/shared/dto";
import AccountBreadcrumbs from "@/components/features/Breadcrumbs/AccountBreadcrumbs";

const TG_AVATAR_COLORS = [
    "#E17076",
    "#7BC862",
    "#E5CA77",
    "#65AADD",
    "#A695E7",
    "#EE7AAE",
    "#55BBA4",
];

function getAvatarColor(telegramId: string): string {
    const num = parseInt(telegramId.slice(-3), 10) || 0;
    return TG_AVATAR_COLORS[num % TG_AVATAR_COLORS.length];
}

interface RunRowProps {
    accountId: string;
    run: InviteRunDto;
    onDelete: (runId: string) => void;
    isDeleting: boolean;
}

function RunRow({ accountId, run, onDelete, isDeleting }: RunRowProps) {
    const t = useTranslations();
    const locale = useLocale();
    const isRunning = run.status === "RUNNING";
    const isCompleted = run.status === "COMPLETED";

    const href = `${FULL_PATH_ROUTE.admin.tgAccounts.path}/${accountId}/invite/${run.id}`;

    return (
        <Box
            sx={{
                px: 1.5,
                py: 1,
                borderRadius: 1.5,
                border: 1,
                borderColor: "divider",
                borderLeft: 3,
                borderLeftColor: isRunning ? "info.main" : isCompleted ? "success.main" : "warning.main",
                bgcolor: "action.hover",
                display: "flex",
                flexDirection: "column",
                gap: 0.75,
            }}
        >
            {/* Header: run number + status chip | actions */}
            <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
                <Box display="flex" alignItems="center" gap={0.75}>
                    <StyledTypography variant="body2" fontWeight={700}>
                        #{run.runNumber}
                    </StyledTypography>
                    <Chip
                        size="small"
                        label={t(`pages.admin.tgAccounts.invite.status.${run.status}`)}
                        color={isRunning ? "info" : isCompleted ? "success" : "warning"}
                        variant="filled"
                        sx={{ height: 20, fontSize: 11 }}
                    />
                </Box>
                <Box display="flex" alignItems="center" gap={0.5} flexShrink={0}>
                    <Link href={href} style={{ textDecoration: "none", color: "inherit" }}>
                        <IconButton size="small">
                            <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Link>
                    {!isRunning && (
                        <Tooltip title={t("pages.admin.tgAccounts.invite.history.delete")}>
                            <span>
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => onDelete(run.id)}
                                    disabled={isDeleting}
                                >
                                    {isDeleting
                                        ? <CircularProgress size={14} color="error" />
                                        : <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                                    }
                                </IconButton>
                            </span>
                        </Tooltip>
                    )}
                </Box>
            </Box>

            {/* Target channel chip */}
            {run.targetChannelSnapshot && (
                <Box>
                    <Chip
                        size="small"
                        avatar={
                            <Avatar
                                src={run.targetChannelSnapshot.photoBase64
                                    ? `data:image/jpeg;base64,${run.targetChannelSnapshot.photoBase64}`
                                    : undefined}
                                sx={{ fontSize: 11 }}
                            >
                                {run.targetChannelSnapshot.title[0]}
                            </Avatar>
                        }
                        label={run.targetChannelSnapshot.title}
                        variant="outlined"
                        sx={{ height: 24, fontSize: 12 }}
                    />
                </Box>
            )}

            {/* Time info */}
            <Box display="flex" alignItems={'start'} flexDirection="column" gap={0.25}>
                <ClientDate
                    date={run.startedAt}
                    format={(date, locale) =>
                        t("pages.admin.tgAccounts.invite.history.started", {
                            time: relativeTime({ date, locale }),
                        })
                    }
                    variant="caption"
                    color="text.disabled"
                />
                {!isRunning && run.finishedAt && (
                    <StyledTypography variant="caption" color="text.disabled">
                        {t("pages.admin.tgAccounts.invite.history.duration" as any, {
                            value: formatDuration(
                                new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime(),
                                locale as any,
                            ),
                        })}
                    </StyledTypography>
                )}
            </Box>

            {/* Counts */}
            {!isRunning && (run.invitedCount > 0 || run.failedCount > 0 || run.pendingCount > 0) && (
                <Box display="flex" gap={0.5}>
                    {run.invitedCount > 0 && (
                        <Chip
                            size="small"
                            icon={<CheckCircleOutlineIcon sx={{ fontSize: "11px !important" }} />}
                            label={run.invitedCount}
                            color="success"
                            variant="filled"
                            sx={{ height: 18, fontSize: 10 }}
                        />
                    )}
                    {run.failedCount > 0 && (
                        <Chip
                            size="small"
                            icon={<ErrorOutlineIcon sx={{ fontSize: "11px !important" }} />}
                            label={run.failedCount}
                            color="error"
                            variant="filled"
                            sx={{ height: 18, fontSize: 10 }}
                        />
                    )}
                    {run.pendingCount > 0 && (
                        <Chip
                            size="small"
                            icon={<RemoveCircleOutlineIcon sx={{ fontSize: "11px !important" }} />}
                            label={run.pendingCount}
                            color="warning"
                            variant="filled"
                            sx={{ height: 18, fontSize: 10 }}
                        />
                    )}
                </Box>
            )}

            {/* Progress bar (running) */}
            {isRunning && run.totalCount > 0 && (
                <LinearProgress
                    variant="determinate"
                    value={Math.round(((run.invitedCount + run.failedCount) / run.totalCount) * 100)}
                    sx={{ height: 4, borderRadius: 2 }}
                    color="info"
                />
            )}
        </Box>
    );
}

interface Props {
    accountId: string;
}

export default function TgAccountDetailComponent({ accountId }: Props) {
    const t = useTranslations();
    const { data: account, isLoading, error, refetch } = useTgAccountDetail(accountId);
    const { data: channels, isLoading: channelsLoading } = useOwnedChannels(accountId);
    const { mutate: syncChannels, isPending: isSyncing } = useSyncOwnedChannels(accountId);
    const { data: inviteHistory } = useInviteHistory(accountId);
    const { mutate: deleteRun, isPending: isDeletingRun, variables: deletingRunId } = useDeleteInviteRun(accountId);
    const { mutate: deleteAllRuns, isPending: isDeletingAll } = useDeleteAllInviteRuns(accountId);
    const { confirm, confirmDialog } = useConfirm();

    const inviteHref = `${FULL_PATH_ROUTE.admin.tgAccounts.path}/${accountId}/invite`;

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" py={8}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !account) {
        return <ErrorHandlerElement error={error} reset={() => refetch()} />;
    }

    const avatarColor = getAvatarColor(account.telegramId);
    const fullName = [account.firstName, account.lastName].filter(Boolean).join(" ");
    const initials = (account.firstName[0] ?? "").toUpperCase() + (account.lastName?.[0]?.toUpperCase() ?? "");
    const channelCount = channels?.length ?? account.ownedChannelsCount;

    const isInviteRunning = account.inviteStatus === "RUNNING";
    const runningRun = inviteHistory?.find((r) => r.status === "RUNNING");
    const finishedRuns = inviteHistory?.filter((r) => r.status !== "RUNNING") ?? [];

    const handleDeleteRun = async (runId: string) => {
        const ok = await confirm({
            title: t("pages.admin.tgAccounts.invite.history.confirmDelete"),
            description: t("pages.admin.tgAccounts.invite.history.confirmDeleteBody"),
        });
        if (!ok) return;
        deleteRun(runId);
    };

    const handleDeleteAllRuns = async () => {
        const ok = await confirm({
            title: t("pages.admin.tgAccounts.invite.history.confirmClearAll"),
            description: t("pages.admin.tgAccounts.invite.history.confirmClearAllBody"),
        });
        if (!ok) return;
        deleteAllRuns();
    };

    return (
        <Box display="flex" flexDirection="column" gap={3}>
            {confirmDialog}
            <AccountBreadcrumbs accountId={accountId} />

            <Box display="flex" gap={3} alignItems={{ xs: "stretch", md: "flex-start" }} flexDirection={{ xs: "column", md: "row" }}>
                {/* Left column: account + channels */}
                <Box display="flex" flexDirection="column" gap={3} sx={{ flex: 1, minWidth: 0 }}>
                    {/* Account card — same style as list */}
                    <Card sx={{ borderRadius: 3 }}>
                        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                            <Box display="flex" gap={2} alignItems="flex-start">
                                <Avatar
                                    src={account.photoUrl ?? undefined}
                                    alt={fullName}
                                    sx={{ width: 56, height: 56, bgcolor: avatarColor, fontSize: 20, fontWeight: 700, flexShrink: 0 }}
                                >
                                    {!account.photoUrl && initials}
                                </Avatar>
                                <Box flex={1} minWidth={0}>
                                    <Box display="flex" alignItems="center" gap={0.5} mb={0.25}>
                                        <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ lineHeight: 1.3 }}>
                                            {fullName}
                                        </Typography>
                                        {account.isPremium && (
                                            <Tooltip title={t("pages.admin.tgAccounts.premium")}>
                                                <StarIcon sx={{ fontSize: 16, color: "#FFB800" }} />
                                            </Tooltip>
                                        )}
                                    </Box>
                                    {account.username && (
                                        <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 0.25 }}>
                                            @{account.username}
                                        </Typography>
                                    )}
                                    <Typography variant="body2" color="text.secondary" noWrap>
                                        {account.phone}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box mt={1.5}>
                                <ClientDate
                                    date={account.createdAt}
                                    format={(date, locale) =>
                                        t("pages.admin.tgAccounts.added", { time: relativeTime({ date, locale }) })
                                    }
                                    variant="caption"
                                    color="text.disabled"
                                />
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Owned channels card */}
                    <Card sx={{ borderRadius: 3 }}>
                        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <GroupIcon color="action" />
                                    <StyledTypography variant="subtitle1" fontWeight={600}>
                                        {t("pages.admin.tgAccounts.ownedChannels.title")}
                                    </StyledTypography>
                                    {!channelsLoading && (
                                        <Chip size="small" label={channelCount} variant="outlined" sx={{ height: 20, fontSize: 11 }} />
                                    )}
                                </Box>
                                <Tooltip title={isSyncing ? t("pages.admin.tgAccounts.ownedChannels.syncing") : t("pages.admin.tgAccounts.ownedChannels.sync")}>
                                    <span>
                                        <IconButton size="small" onClick={() => syncChannels()} disabled={isSyncing}>
                                            <RefreshIcon
                                                fontSize="small"
                                                sx={{
                                                    animation: isSyncing ? "spin 1s linear infinite" : "none",
                                                    "@keyframes spin": { "100%": { transform: "rotate(360deg)" } },
                                                }}
                                            />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </Box>

                            {channelsLoading && (
                                <Box display="flex" justifyContent="center" py={2}>
                                    <CircularProgress size={20} />
                                </Box>
                            )}

                            {!channelsLoading && channels && channels.length > 0 && (
                                <Box display="flex" flexDirection="column" gap={0.75}>
                                    {channels.map((ch) => (
                                        <Box
                                            key={ch.id}
                                            display="flex"
                                            alignItems="center"
                                            gap={1.5}
                                            py={1}
                                            px={1.5}
                                            sx={{ borderRadius: 2, bgcolor: "action.hover" }}
                                        >
                                            <Avatar
                                                src={ch.photoBase64 ? `data:image/jpeg;base64,${ch.photoBase64}` : undefined}
                                                sx={{ width: 34, height: 34, fontSize: 13, bgcolor: "primary.main", flexShrink: 0 }}
                                            >
                                                {ch.title[0]}
                                            </Avatar>
                                            <Box flex={1} minWidth={0}>
                                                <StyledTypography variant="body2" fontWeight={500} noWrap>
                                                    {ch.title}
                                                </StyledTypography>
                                                {ch.username && (
                                                    <StyledTypography variant="caption" color="text.disabled" noWrap display="block">
                                                        @{ch.username}
                                                    </StyledTypography>
                                                )}
                                            </Box>
                                            <Tooltip title={ch.url}>
                                                <IconButton
                                                    size="small"
                                                    component="a"
                                                    href={ch.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    sx={{ flexShrink: 0 }}
                                                >
                                                    <OpenInNewIcon sx={{ fontSize: 16 }} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Box>

                {/* Right column: invite */}
                <Box flex={1} minWidth={0}>
            <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <GroupAddIcon color="action" />
                        <StyledTypography variant="subtitle1" fontWeight={600}>
                            {t("pages.admin.tgAccounts.invite.name")}
                        </StyledTypography>
                    </Box>

                    {/* Running state: compact progress + link */}
                    {isInviteRunning && runningRun && (
                        <Box
                            mb={2}
                            p={1.5}
                            sx={{
                                borderRadius: 2,
                                border: 1,
                                borderColor: "info.main",
                                bgcolor: "action.hover",
                            }}
                        >
                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1} gap={1}>
                                <Box display="flex" alignItems="center" gap={0.75} flexWrap="wrap" minWidth={0}>
                                    <StyledTypography variant="body2" fontWeight={700}>
                                        #{runningRun.runNumber}
                                    </StyledTypography>
                                    <Chip
                                        size="small"
                                        icon={<StopIcon sx={{ fontSize: "12px !important" }} />}
                                        label={t("pages.admin.tgAccounts.invite.status.RUNNING")}
                                        color="info"
                                        variant="filled"
                                        sx={{ height: 20, fontSize: 11 }}
                                    />
                                    {runningRun.targetChannelSnapshot && (
                                        <Chip
                                            size="small"
                                            avatar={
                                                <Avatar
                                                    src={runningRun.targetChannelSnapshot.photoBase64
                                                        ? `data:image/jpeg;base64,${runningRun.targetChannelSnapshot.photoBase64}`
                                                        : undefined}
                                                    sx={{ fontSize: 11 }}
                                                >
                                                    {runningRun.targetChannelSnapshot.title[0]}
                                                </Avatar>
                                            }
                                            label={runningRun.targetChannelSnapshot.title}
                                            variant="outlined"
                                            sx={{ height: 24, fontSize: 12 }}
                                        />
                                    )}
                                </Box>
                                <Link href={`${FULL_PATH_ROUTE.admin.tgAccounts.path}/${accountId}/invite/${runningRun.id}`} style={{ textDecoration: "none" }}>
                                    <Chip
                                        size="small"
                                        label={t("pages.admin.tgAccounts.invite.openRun")}
                                        color="info"
                                        variant="outlined"
                                        clickable
                                        sx={{ fontSize: 11 }}
                                    />
                                </Link>
                            </Box>
                            {account.inviteProgress && (
                                <>
                                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                                        <StyledTypography variant="caption" color="text.secondary">
                                            {account.inviteProgress.invited + account.inviteProgress.failed} / {account.inviteProgress.total}
                                        </StyledTypography>
                                        <StyledTypography variant="caption" color="text.secondary">
                                            {account.inviteProgress.total > 0
                                                ? Math.round(((account.inviteProgress.invited + account.inviteProgress.failed) / account.inviteProgress.total) * 100)
                                                : 0}%
                                        </StyledTypography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={account.inviteProgress.total > 0
                                            ? Math.round(((account.inviteProgress.invited + account.inviteProgress.failed) / account.inviteProgress.total) * 100)
                                            : 0}
                                        color="info"
                                        sx={{ height: 6, borderRadius: 3 }}
                                    />
                                </>
                            )}
                        </Box>
                    )}

                    {/* History list */}
                    {finishedRuns.length > 0 && (
                        <Box display="flex" flexDirection="column" gap={0.75} mb={2}>
                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                                <Box display="flex" alignItems="center" gap={0.5}>
                                    <HistoryIcon color="action" sx={{ fontSize: 14 }} />
                                    <StyledTypography variant="caption" color="text.secondary" fontWeight={600}>
                                        {t("pages.admin.tgAccounts.invite.history.title")}
                                    </StyledTypography>
                                    <Chip size="small" label={finishedRuns.length} sx={{ height: 16, fontSize: 10 }} />
                                </Box>
                                <Tooltip title={t("pages.admin.tgAccounts.invite.history.clearAll")}>
                                    <span>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={handleDeleteAllRuns}
                                            disabled={isDeletingAll}
                                        >
                                            {isDeletingAll
                                                ? <CircularProgress size={14} color="error" />
                                                : <DeleteSweepIcon sx={{ fontSize: 18 }} />
                                            }
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </Box>
                            <Box
                                display="flex"
                                flexDirection="column"
                                gap={0.75}
                                sx={{ maxHeight: 280, overflowY: "auto", pr: 0.5 }}
                            >
                                {finishedRuns.map((run) => (
                                    <RunRow
                                        key={run.id}
                                        accountId={accountId}
                                        run={run}
                                        onDelete={handleDeleteRun}
                                        isDeleting={isDeletingRun && deletingRunId === run.id}
                                    />
                                ))}
                            </Box>
                            <Divider sx={{ mt: 1 }} />
                        </Box>
                    )}

                    {/* Add to channel button (only when not running) */}
                    {!isInviteRunning && (
                        <Link href={inviteHref} style={{ textDecoration: "none" }}>
                            <StyledButton
                                variant="contained"
                                startIcon={<AddIcon />}
                                fullWidth
                            >
                                {t("pages.admin.tgAccounts.ownedChannels.addToChannel")}
                            </StyledButton>
                        </Link>
                    )}
                </CardContent>
            </Card>
                </Box>
            </Box>
        </Box>
    );
}
