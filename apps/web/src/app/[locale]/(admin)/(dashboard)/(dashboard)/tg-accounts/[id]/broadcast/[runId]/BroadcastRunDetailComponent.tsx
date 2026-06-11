"use client";

import { useBroadcastProgress, useBroadcastRun, useBroadcastRunRecipients } from "@/hooks/tanstack/useBroadcast";
import { useStopBroadcast } from "@/hooks/tanstack/useBroadcastMutations";
import { useConfirm } from "@/hooks/useConfirm";
import { RecipientFeed } from "@/app/[locale]/(admin)/(dashboard)/(dashboard)/tg-accounts/[id]/broadcast/RecipientFeed";
import { BroadcastRunRecipientDto } from "@myorg/shared/dto";
import {
    Avatar,
    Box,
    Chip,
    CircularProgress,
    Divider,
    LinearProgress,
    Typography,
} from "@mui/material";
import StopIcon from "@mui/icons-material/Stop";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { useTranslations, useLocale } from "next-intl";
import { StyledButton } from "@/components/ui/StyledButton";
import { StyledTypography } from "@/components/ui/StyledTypography";
import { ClientDate } from "@/components/common/ClientDate";
import { ErrorDataButton } from "@/components/common/ErrorDataDialog";
import { EtaInfo } from "@/components/common/EtaInfo";
import { relativeTime, formatDuration } from "@myorg/shared/utils";
import AccountBreadcrumbs from "@/components/features/Breadcrumbs/AccountBreadcrumbs";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";
import { PaginationComponent } from "@/components/common/PaginationComponent";
import { useState } from "react";
import ErrorHandlerElement from "@/components/feedback/error/ErrorHandlerElement";
import { broadcastKeys } from "@/lib/tanstack/keys";
import { useQueryClient } from "@tanstack/react-query";

const LIMIT = 20;

function RunRecipientRow({ r }: { r: BroadcastRunRecipientDto }) {
    const displayName =
        [r.firstName, r.lastName].filter(Boolean).join(" ") ||
        (r.username ? `@${r.username}` : r.userId);

    const borderColor =
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
            <Avatar sx={{ width: 34, height: 34, fontSize: 13, bgcolor: borderColor, flexShrink: 0 }}>
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
                {r.sentAt && (
                    <ClientDate
                        date={r.sentAt}
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

interface CompletedViewProps {
    accountId: string;
    runId: string;
    sentCount: number;
    failedCount: number;
    pendingCount: number;
}

function CompletedRunRecipients({ accountId, runId, sentCount, failedCount, pendingCount }: CompletedViewProps) {
    const t = useTranslations();
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<"SENT" | "FAILED" | "CANCELLED" | undefined>(undefined);

    const { data, isLoading } = useBroadcastRunRecipients(
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
                    label={t("pages.admin.tgAccounts.broadcast.filter.all")}
                    variant={!statusFilter ? "filled" : "outlined"}
                    clickable
                    onClick={() => handleFilter(undefined)}
                    sx={{ height: 24 }}
                />
                <Chip
                    size="small"
                    icon={<CheckCircleOutlineIcon sx={{ fontSize: "14px !important" }} />}
                    label={t("pages.admin.tgAccounts.broadcast.history.sentList", { count: sentCount })}
                    color="success"
                    variant={statusFilter === "SENT" ? "filled" : "outlined"}
                    clickable
                    onClick={() => handleFilter(statusFilter === "SENT" ? undefined : "SENT")}
                    sx={{ height: 24 }}
                />
                <Chip
                    size="small"
                    icon={<ErrorOutlineIcon sx={{ fontSize: "14px !important" }} />}
                    label={t("pages.admin.tgAccounts.broadcast.history.failedList", { count: failedCount })}
                    color="error"
                    variant={statusFilter === "FAILED" ? "filled" : "outlined"}
                    clickable
                    onClick={() => handleFilter(statusFilter === "FAILED" ? undefined : "FAILED")}
                    sx={{ height: 24 }}
                />
                <Chip
                    size="small"
                    icon={<RemoveCircleOutlineIcon sx={{ fontSize: "14px !important" }} />}
                    label={t("pages.admin.tgAccounts.broadcast.history.cancelledList", { count: pendingCount })}
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
                            {t("pages.admin.tgAccounts.broadcast.recipients.empty")}
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

interface Props {
    accountId: string;
    runId: string;
}

export default function BroadcastRunDetailComponent({ accountId, runId }: Props) {
    const t = useTranslations();
    const locale = useLocale();
    const queryClient = useQueryClient();
    const { data: run, isLoading, error } = useBroadcastRun(accountId, runId);
    const { data: progress } = useBroadcastProgress(accountId, run?.status === "RUNNING");
    const { confirm, confirmDialog } = useConfirm();
    const { mutate: stop, isPending: isStopping } = useStopBroadcast(accountId);

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
                reset={() => queryClient.invalidateQueries({ queryKey: broadcastKeys.run(accountId, runId) })}
            />
        );
    }

    const isRunning = run.status === "RUNNING";
    const isCompleted = run.status === "COMPLETED";
    const sent = progress?.sent ?? run.sentCount;
    const failed = progress?.failed ?? run.failedCount;
    const pending = progress?.pending ?? Math.max(0, run.totalCount - run.sentCount - run.failedCount);
    const total = progress?.total ?? run.totalCount;
    const progressValue = total > 0 ? Math.round(((sent + failed) / total) * 100) : 0;
    const message = progress?.message ?? run.message;
    const channels = run.channelsSnapshot;

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
            <AccountBreadcrumbs
                accountId={accountId}
                extra={[
                    { name: t("pages.admin.tgAccounts.broadcast.name"), href: `${FULL_PATH_ROUTE.admin.tgAccounts.path}/${accountId}/broadcast` },
                    { name: `#${run.runNumber}`, href: `${FULL_PATH_ROUTE.admin.tgAccounts.path}/${accountId}/broadcast/${runId}` },
                ]}
            />

            <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
                <Box>
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                        <StyledTypography variant="h5" fontWeight={700}>
                            {t("pages.admin.tgAccounts.broadcast.runTitle", { n: run.runNumber })}
                        </StyledTypography>
                        <Chip
                            size="small"
                            label={t(`pages.admin.tgAccounts.broadcast.status.${run.status}`)}
                            color={isRunning ? "info" : isCompleted ? "success" : "warning"}
                            variant="outlined"
                        />
                    </Box>
                    <Box display="flex" flexDirection="column" gap={0.25}>
                        <ClientDate
                            date={run.startedAt}
                            format={(date, locale) =>
                                t("pages.admin.tgAccounts.broadcast.history.started", {
                                    time: relativeTime({ date, locale }),
                                })
                            }
                            variant="caption"
                            color="text.disabled"
                        />
                        {!isRunning && run.finishedAt && (
                            <StyledTypography variant="caption" color="text.disabled">
                                {t("pages.admin.tgAccounts.broadcast.history.duration" as any, {
                                    value: formatDuration(
                                        new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime(),
                                        locale as any,
                                    ),
                                })}
                            </StyledTypography>
                        )}
                        <StyledTypography variant="caption" color="text.disabled">
                            {t("pages.admin.tgAccounts.broadcast.delay.summary", {
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
                        {t("pages.admin.tgAccounts.broadcast.actions.stop")}
                    </StyledButton>
                )}
            </Box>

            {/* Message */}
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
                <StyledTypography variant="body2">{message}</StyledTypography>
            </Box>

            {/* Progress bar */}
            <Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                    <StyledTypography variant="body2" color="text.secondary">
                        {sent + failed} / {total}
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
                            nextAttempt: (time) => time ? t("pages.admin.tgAccounts.broadcast.eta.nextAttempt", { time }) : t("pages.admin.tgAccounts.broadcast.eta.nextAttemptSoon"),
                            finish: (time) => time ? t("pages.admin.tgAccounts.broadcast.eta.finish", { time }) : t("pages.admin.tgAccounts.broadcast.eta.finishSoon"),
                        }}
                        sx={{ mt: 1 }}
                    />
                )}
            </Box>

            {/* Target channels */}
            {channels.length > 0 && (
                <Box>
                    <StyledTypography variant="subtitle2" color="text.secondary" mb={1}>
                        {t("pages.admin.tgAccounts.broadcast.channels.title")}
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
                    <RecipientFeed
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
                        sentCount={run.sentCount}
                        failedCount={run.failedCount}
                        pendingCount={run.pendingCount}
                    />
                )}
            </Box>
        </Box>
    );
}
