"use client";

import { useInviteProgress, useInviteRun, useInviteRunRecipients } from "@/hooks/tanstack/useInvite";
import { useStopInvite } from "@/hooks/tanstack/useInviteMutations";
import { useConfirm } from "@/hooks/useConfirm";
import { InviteRecipientFeed } from "@/app/[locale]/(admin)/(dashboard)/(dashboard)/tg-accounts/[id]/invite/InviteRecipientFeed";
import { InviteRunRecipientDto } from "@myorg/shared/dto";
import {
    Avatar,
    Box,
    Chip,
    CircularProgress,
    Divider,
    IconButton,
    LinearProgress,
    Tooltip,
    Typography,
} from "@mui/material";
import StopIcon from "@mui/icons-material/Stop";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { useTranslations } from "next-intl";
import { StyledButton } from "@/components/ui/StyledButton";
import { StyledTypography } from "@/components/ui/StyledTypography";
import { ClientDate } from "@/components/common/ClientDate";
import { ErrorDataButton } from "@/components/common/ErrorDataDialog";
import { EtaInfo } from "@/components/common/EtaInfo";
import { relativeTime, formatDuration } from "@myorg/shared/utils";
import { useLocale } from "next-intl";
import AccountBreadcrumbs from "@/components/features/Breadcrumbs/AccountBreadcrumbs";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";
import { PaginationComponent } from "@/components/common/PaginationComponent";
import { useState } from "react";
import ErrorHandlerElement from "@/components/feedback/error/ErrorHandlerElement";
import { inviteKeys } from "@/lib/tanstack/keys";
import { useQueryClient } from "@tanstack/react-query";

const LIMIT = 20;

// ── Recipient row (for completed run) ─────────────────────────────────────────

function RunRecipientRow({ r }: { r: InviteRunRecipientDto }) {
    const displayName =
        [r.firstName, r.lastName].filter(Boolean).join(" ") ||
        (r.username ? `@${r.username}` : r.userId);

    const borderColor =
        r.status === "SENT" ? "success.main" :
        r.status === "CANCELLED" ? "warning.main" : "error.main";
    const avatarBg =
        r.status === "SENT" ? "success.main" :
        r.status === "CANCELLED" ? "warning.main" : "error.main";

    return (
        <Box
            display="flex"
            alignItems="center"
            gap={1.5}
            py={1.25}
            px={1.5}
            sx={{
                borderLeft: 3,
                borderColor,
                borderRadius: "0 8px 8px 0",
                bgcolor: "action.hover",
            }}
        >
            <Avatar
                sx={{
                    width: 34,
                    height: 34,
                    fontSize: 13,
                    bgcolor: avatarBg,
                    flexShrink: 0,
                }}
            >
                {(r.firstName?.[0] ?? r.username?.[0] ?? "?").toUpperCase()}
            </Avatar>
            <Box flex={1} minWidth={0}>
                <StyledTypography variant="body2" fontWeight={500} noWrap>
                    {displayName}
                </StyledTypography>
                {r.status === "FAILED" && r.errorMessage && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                        <StyledTypography variant="caption" color="error.main" noWrap>
                            {r.errorMessage}
                        </StyledTypography>
                        <ErrorDataButton errorData={r.errorData} />
                    </Box>
                )}
                {(r.status === "SENT" || r.status === "CANCELLED") && r.username && (
                    <StyledTypography variant="caption" color="text.disabled" noWrap display="block">
                        @{r.username}
                    </StyledTypography>
                )}
            </Box>
            <Box display="flex" flexDirection="column" alignItems="flex-end" flexShrink={0} gap={0.25}>
                {r.status === "SENT" ? (
                    <CheckCircleOutlineIcon sx={{ fontSize: 18, color: "success.main" }} />
                ) : r.status === "CANCELLED" ? (
                    <RemoveCircleOutlineIcon sx={{ fontSize: 18, color: "warning.main" }} />
                ) : (
                    <ErrorOutlineIcon sx={{ fontSize: 18, color: "error.main" }} />
                )}
                {r.invitedAt && (
                    <ClientDate
                        date={r.invitedAt}
                        format={(date, locale) => relativeTime({ date, locale })}
                        variant="caption"
                        color="text.disabled"
                        sx={{ fontSize: 10 }}
                    />
                )}
            </Box>
        </Box>
    );
}

// ── Completed/Stopped run view ─────────────────────────────────────────────────

interface CompletedViewProps {
    accountId: string;
    runId: string;
    invitedCount: number;
    failedCount: number;
    pendingCount: number;
}

function CompletedRunRecipients({ accountId, runId, invitedCount, failedCount, pendingCount }: CompletedViewProps) {
    const t = useTranslations();
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<"SENT" | "FAILED" | "CANCELLED" | undefined>(undefined);

    const { data, isLoading } = useInviteRunRecipients(
        accountId,
        runId,
        { page, limit: LIMIT, status: statusFilter },
        true,
    );

    const handleFilter = (f: "SENT" | "FAILED" | "CANCELLED" | undefined) => {
        setStatusFilter(f);
        setPage(1);
    };

    return (
        <Box display="flex" flexDirection="column" gap={2}>
            <Box display="flex" flexWrap="wrap" gap={1}>
                <Chip
                    size="small"
                    label={t("pages.admin.tgAccounts.invite.filter.all")}
                    variant={!statusFilter ? "filled" : "outlined"}
                    clickable
                    onClick={() => handleFilter(undefined)}
                    sx={{ height: 24 }}
                />
                <Chip
                    size="small"
                    icon={<CheckCircleOutlineIcon sx={{ fontSize: "14px !important" }} />}
                    label={t("pages.admin.tgAccounts.invite.history.invitedList", { count: invitedCount })}
                    color="success"
                    variant={statusFilter === "SENT" ? "filled" : "outlined"}
                    clickable
                    onClick={() => handleFilter(statusFilter === "SENT" ? undefined : "SENT")}
                    sx={{ height: 24 }}
                />
                <Chip
                    size="small"
                    icon={<ErrorOutlineIcon sx={{ fontSize: "14px !important" }} />}
                    label={t("pages.admin.tgAccounts.invite.history.failedList", { count: failedCount })}
                    color="error"
                    variant={statusFilter === "FAILED" ? "filled" : "outlined"}
                    clickable
                    onClick={() => handleFilter(statusFilter === "FAILED" ? undefined : "FAILED")}
                    sx={{ height: 24 }}
                />
                <Chip
                    size="small"
                    icon={<RemoveCircleOutlineIcon sx={{ fontSize: "14px !important" }} />}
                    label={t("pages.admin.tgAccounts.invite.history.cancelledList", { count: pendingCount })}
                    color="warning"
                    variant={statusFilter === "CANCELLED" ? "filled" : "outlined"}
                    clickable
                    onClick={() => handleFilter(statusFilter === "CANCELLED" ? undefined : "CANCELLED")}
                    sx={{ height: 24 }}
                />
            </Box>

            {isLoading ? (
                <Box display="flex" justifyContent="center" py={3}>
                    <CircularProgress size={24} />
                </Box>
            ) : (
                <Box display="flex" flexDirection="column" gap={0.75}>
                    {data?.data.length === 0 && (
                        <Typography variant="body2" color="text.disabled" py={1}>
                            {t("pages.admin.tgAccounts.invite.recipients.empty")}
                        </Typography>
                    )}
                    {data?.data.map((r) => <RunRecipientRow key={r.id} r={r} />)}
                </Box>
            )}

            {data && data.meta.pageCount > 1 && (
                <PaginationComponent page={page} count={data.meta.pageCount} onChange={setPage} />
            )}
        </Box>
    );
}

// ── Main component ─────────────────────────────────────────────────────────────

interface Props {
    accountId: string;
    runId: string;
}

export default function InviteRunDetailComponent({ accountId, runId }: Props) {
    const t = useTranslations();
    const locale = useLocale();
    const queryClient = useQueryClient();
    const { data: run, isLoading, error } = useInviteRun(accountId, runId);
    const { data: progress } = useInviteProgress(accountId, run?.status === "RUNNING");
    const { confirm, confirmDialog } = useConfirm();
    const { mutate: stop, isPending: isStopping } = useStopInvite(accountId);

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" py={8}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !run) {
        return (
            <ErrorHandlerElement
                error={error}
                reset={() => queryClient.invalidateQueries({ queryKey: inviteKeys.run(accountId, runId) })}
            />
        );
    }

    const isRunning = run.status === "RUNNING";
    const isCompleted = run.status === "COMPLETED";
    const sent = progress?.sent ?? run.invitedCount;
    const failed = progress?.failed ?? run.failedCount;
    const pending = progress?.pending ?? Math.max(0, run.totalCount - run.invitedCount - run.failedCount);
    const total = progress?.total ?? run.totalCount;
    const progressValue = total > 0 ? Math.round(((sent + failed) / total) * 100) : 0;
    const targetTitle = run.targetChannelSnapshot?.title ?? null;
    const channels = run.channelsSnapshot;

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
            <AccountBreadcrumbs
                accountId={accountId}
                extra={[
                    { name: t("pages.admin.tgAccounts.invite.name"), href: `${FULL_PATH_ROUTE.admin.tgAccounts.path}/${accountId}/invite` },
                    { name: `#${run.runNumber}`, href: `${FULL_PATH_ROUTE.admin.tgAccounts.path}/${accountId}/invite/${runId}` },
                ]}
            />

            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
                <Box>
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                        <StyledTypography variant="h5" fontWeight={700}>
                            {t("pages.admin.tgAccounts.invite.runTitle", { n: run.runNumber })}
                        </StyledTypography>
                        <Chip
                            size="small"
                            label={t(`pages.admin.tgAccounts.invite.status.${run.status}`)}
                            color={isRunning ? "info" : isCompleted ? "success" : "warning"}
                            variant="outlined"
                        />
                    </Box>
                    <Box display="flex" flexDirection="column" gap={0.25}>
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
                        <StyledTypography variant="caption" color="text.disabled">
                            {t("pages.admin.tgAccounts.invite.delay.summary", {
                                min: +(run.delayBaseSeconds / 60).toFixed(1),
                                max: +((run.delayBaseSeconds + run.delayJitterSeconds) / 60).toFixed(1),
                            })}
                        </StyledTypography>
                    </Box>
                </Box>

                {isRunning && (
                    <StyledButton
                        variant="outlined"
                        color="error"
                        startIcon={<StopIcon />}
                        onClick={handleStop}
                        loading={isStopping}
                    >
                        {t("pages.admin.tgAccounts.invite.actions.stop")}
                    </StyledButton>
                )}
            </Box>

            {/* Target channel */}
            {targetTitle && (
                <Box
                    display="flex"
                    alignItems="center"
                    gap={1.5}
                    p={2}
                    sx={{ borderRadius: 2, bgcolor: "action.hover" }}
                >
                    <Avatar
                        src={run.targetChannelSnapshot?.photoBase64 ? `data:image/jpeg;base64,${run.targetChannelSnapshot.photoBase64}` : undefined}
                        sx={{ width: 36, height: 36, fontSize: 14, bgcolor: "primary.main", flexShrink: 0 }}
                    >
                        {targetTitle[0]}
                    </Avatar>
                    <Box flex={1} minWidth={0}>
                        <StyledTypography variant="caption" color="text.disabled" display="block">
                            {t("pages.admin.tgAccounts.invite.targetChannel.label")}
                        </StyledTypography>
                        <StyledTypography variant="body2" fontWeight={600} noWrap>
                            {targetTitle}
                        </StyledTypography>
                        {run.targetChannelSnapshot?.username && (
                            <StyledTypography variant="caption" color="text.disabled" noWrap display="block">
                                @{run.targetChannelSnapshot.username}
                            </StyledTypography>
                        )}
                    </Box>
                    <Tooltip title={run.targetChannelSnapshot?.url ?? ""}>
                        <IconButton
                            size="small"
                            component="a"
                            href={run.targetChannelSnapshot?.url ?? "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ flexShrink: 0 }}
                        >
                            <OpenInNewIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            )}

            {/* Progress bar */}
            <Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                    <StyledTypography variant="body2" color="text.secondary">
                        {sent+failed} / {total}
                    </StyledTypography>
                    <StyledTypography variant="body2" color="text.secondary">
                        {progressValue}%
                    </StyledTypography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={progressValue}
                    color={isRunning ? "info" : isCompleted ? "success" : "warning"}
                    sx={{ height: 8, borderRadius: 4 }}
                />
                {isRunning && progress && (
                    <EtaInfo
                        nextAttemptAt={progress.nextAttemptAt}
                        estimatedFinishAt={progress.estimatedFinishAt}
                        labels={{
                            nextAttempt: (time) => time ? t("pages.admin.tgAccounts.invite.eta.nextAttempt", { time }) : t("pages.admin.tgAccounts.invite.eta.nextAttemptSoon"),
                            finish: (time) => time ? t("pages.admin.tgAccounts.invite.eta.finish", { time }) : t("pages.admin.tgAccounts.invite.eta.finishSoon"),
                        }}
                        sx={{ mt: 1 }}
                    />
                )}
            </Box>

            {/* Source channels */}
            {channels.length > 0 && (
                <Box>
                    <StyledTypography variant="subtitle2" color="text.secondary" mb={1}>
                        {t("pages.admin.tgAccounts.invite.channels.title")}
                    </StyledTypography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                        {channels.map((channel) => (
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
            )}

            <Divider />

            {/* Recipients */}
            <Box>
                {isRunning ? (
                    <InviteRecipientFeed
                        accountId={accountId}
                        sent={sent}
                        failed={failed}
                        pending={pending}
                        isRunning
                    />
                ) : (
                    <CompletedRunRecipients
                        accountId={accountId}
                        runId={runId}
                        invitedCount={run.invitedCount}
                        failedCount={run.failedCount}
                        pendingCount={run.pendingCount}
                    />
                )}
            </Box>
        </Box>
    );
}
