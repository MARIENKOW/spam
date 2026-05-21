"use client";

import { useState } from "react";
import { useBroadcastHistory, useBroadcastRunRecipients } from "@/hooks/tanstack/useBroadcast";
import { useDeleteAllBroadcastRuns, useDeleteBroadcastRun } from "@/hooks/tanstack/useBroadcastMutations";
import { useConfirm } from "@/hooks/useConfirm";
import { BroadcastRunDto, BroadcastRunRecipientDto } from "@myorg/shared/dto";
import {
    Avatar,
    Box,
    Chip,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Tooltip,
    Typography,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import { useTranslations } from "next-intl";
import { StyledTypography } from "@/components/ui/StyledTypography";
import { ClientDate } from "@/components/common/ClientDate";
import { PaginationComponent } from "@/components/common/PaginationComponent";
import { relativeTime } from "@myorg/shared/utils";

const LIMIT = 20;

// ── Recipient dialog ──────────────────────────────────────────────────────────

function RecipientRow({ r }: { r: BroadcastRunRecipientDto }) {
    const displayName =
        [r.firstName, r.lastName].filter(Boolean).join(" ") ||
        (r.username ? `@${r.username}` : r.userId);

    return (
        <Box
            display="flex"
            alignItems="center"
            gap={1.5}
            py={0.75}
            px={1}
            sx={{
                borderLeft: 3,
                borderColor: r.status === "SENT" ? "success.main" : "error.main",
                borderRadius: "0 6px 6px 0",
                bgcolor: "action.hover",
            }}
        >
            <Avatar
                sx={{
                    width: 28,
                    height: 28,
                    fontSize: 11,
                    bgcolor: r.status === "SENT" ? "success.main" : "error.main",
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
                    <StyledTypography variant="caption" color="error.main" noWrap display="block">
                        {r.errorMessage}
                    </StyledTypography>
                )}
            </Box>
            {r.status === "SENT" ? (
                <CheckCircleOutlineIcon sx={{ fontSize: 14, color: "success.main", flexShrink: 0 }} />
            ) : (
                <ErrorOutlineIcon sx={{ fontSize: 14, color: "error.main", flexShrink: 0 }} />
            )}
        </Box>
    );
}

interface RecipientsDialogProps {
    accountId: string;
    run: BroadcastRunDto;
    status: "SENT" | "FAILED";
    onClose: () => void;
}

function RecipientsDialog({ accountId, run, status, onClose }: RecipientsDialogProps) {
    const t = useTranslations();
    const [page, setPage] = useState(1);
    const { data, isLoading } = useBroadcastRunRecipients(accountId, run.id, { page, limit: LIMIT, status }, true);

    return (
        <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1.5 }}>
                <Box display="flex" alignItems="center" gap={1}>
                    {status === "SENT"
                        ? <CheckCircleOutlineIcon color="success" fontSize="small" />
                        : <ErrorOutlineIcon color="error" fontSize="small" />}
                    <Typography variant="subtitle1" fontWeight={600}>
                        {t("pages.admin.tgAccounts.broadcast.history.recipientsDialogTitle")}
                    </Typography>
                    <Chip
                        size="small"
                        label={status === "SENT"
                            ? t("pages.admin.tgAccounts.broadcast.status.SENT")
                            : t("pages.admin.tgAccounts.broadcast.status.FAILED")}
                        color={status === "SENT" ? "success" : "error"}
                        variant="outlined"
                    />
                </Box>
                <IconButton onClick={onClose} size="small"><CloseIcon fontSize="small" /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 1 }}>
                {isLoading ? (
                    <Box display="flex" justifyContent="center" py={3}><CircularProgress size={28} /></Box>
                ) : (
                    <Box display="flex" flexDirection="column" gap={0.5}>
                        {data?.data.length === 0 && (
                            <Typography variant="body2" color="text.disabled" textAlign="center" py={2}>—</Typography>
                        )}
                        {data?.data.map((r) => <RecipientRow key={r.id} r={r} />)}
                        {data && data.meta.pageCount > 1 && (
                            <Box mt={1}>
                                <PaginationComponent page={page} count={data.meta.pageCount} onChange={setPage} />
                            </Box>
                        )}
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
}

// ── Single run card ───────────────────────────────────────────────────────────

interface RunCardProps {
    accountId: string;
    run: BroadcastRunDto;
    onDelete: (id: string) => void;
    isDeleting: boolean;
}

function RunCard({ accountId, run, onDelete, isDeleting }: RunCardProps) {
    const t = useTranslations();
    const [dialog, setDialog] = useState<"SENT" | "FAILED" | null>(null);
    const isCompleted = run.status === "COMPLETED";

    return (
        <>
            {dialog && (
                <RecipientsDialog
                    accountId={accountId}
                    run={run}
                    status={dialog}
                    onClose={() => setDialog(null)}
                />
            )}

            <Box
                sx={{
                    px: 1.5,
                    py: 1,
                    borderRadius: 1.5,
                    border: 1,
                    borderColor: "divider",
                    borderLeft: 3,
                    borderLeftColor: isCompleted ? "success.main" : "warning.main",
                    bgcolor: "action.hover",
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.75,
                }}
            >
                {/* Row 1: status + time + delete */}
                <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
                    <Box display="flex" alignItems="center" gap={0.75} flexWrap="wrap" minWidth={0}>
                        <Chip
                            size="small"
                            label={t(`pages.admin.tgAccounts.broadcast.status.${run.status}`)}
                            color={isCompleted ? "success" : "warning"}
                            variant="filled"
                            sx={{ height: 20, fontSize: 11 }}
                        />
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
                    </Box>
                    <Tooltip title={t("pages.admin.tgAccounts.broadcast.history.delete")}>
                        <span>
                            <IconButton size="small" color="error" onClick={() => onDelete(run.id)} disabled={isDeleting}>
                                {isDeleting
                                    ? <CircularProgress size={14} color="error" />
                                    : <DeleteOutlineIcon sx={{ fontSize: 16 }} />}
                            </IconButton>
                        </span>
                    </Tooltip>
                </Box>

                {/* Row 2: message preview */}
                <StyledTypography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        lineHeight: 1.4,
                    }}
                >
                    {run.message}
                </StyledTypography>

                {/* Row 3: stats chips */}
                <Box display="flex" flexWrap="wrap" gap={0.5}>
                    <Chip
                        size="small"
                        icon={<CheckCircleOutlineIcon sx={{ fontSize: "12px !important" }} />}
                        label={t("pages.admin.tgAccounts.broadcast.history.sentList", { count: run.sentCount })}
                        color="success"
                        variant={run.sentCount > 0 ? "filled" : "outlined"}
                        clickable={run.sentCount > 0}
                        onClick={run.sentCount > 0 ? () => setDialog("SENT") : undefined}
                        sx={{ height: 22, fontSize: 11 }}
                    />
                    <Chip
                        size="small"
                        icon={<ErrorOutlineIcon sx={{ fontSize: "12px !important" }} />}
                        label={t("pages.admin.tgAccounts.broadcast.history.failedList", { count: run.failedCount })}
                        color={run.failedCount > 0 ? "error" : "default"}
                        variant={run.failedCount > 0 ? "filled" : "outlined"}
                        clickable={run.failedCount > 0}
                        onClick={run.failedCount > 0 ? () => setDialog("FAILED") : undefined}
                        sx={{ height: 22, fontSize: 11 }}
                    />
                </Box>

                {/* Row 4: channels */}
                {run.channelsSnapshot.length > 0 && (
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {run.channelsSnapshot.map((ch) => (
                            <Chip
                                key={ch.id}
                                size="small"
                                avatar={
                                    <Avatar src={ch.photoUrl ?? undefined} sx={{ fontSize: 9 }}>
                                        {ch.title[0]}
                                    </Avatar>
                                }
                                label={ch.title}
                                variant="outlined"
                                sx={{ height: 20, fontSize: 11 }}
                            />
                        ))}
                    </Box>
                )}
            </Box>
        </>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
    accountId: string;
}

export function BroadcastHistory({ accountId }: Props) {
    const t = useTranslations();
    const { confirm, confirmDialog } = useConfirm();
    const { data: history } = useBroadcastHistory(accountId);
    const { mutate: deleteRun, isPending: isDeleting, variables: deletingId } = useDeleteBroadcastRun(accountId);
    const { mutate: deleteAll, isPending: isDeletingAll } = useDeleteAllBroadcastRuns(accountId);

    if (!history || history.length === 0) return null;

    const handleDelete = async (runId: string) => {
        const ok = await confirm({
            title: t("pages.admin.tgAccounts.broadcast.history.confirmDelete"),
            description: t("pages.admin.tgAccounts.broadcast.history.confirmDeleteBody"),
        });
        if (!ok) return;
        deleteRun(runId);
    };

    const handleClearAll = async () => {
        const ok = await confirm({
            title: t("pages.admin.tgAccounts.broadcast.history.confirmClearAll"),
            description: t("pages.admin.tgAccounts.broadcast.history.confirmClearAllBody"),
        });
        if (!ok) return;
        deleteAll();
    };

    return (
        <>
            {confirmDialog}
            <Box display="flex" flexDirection="column" gap={1}>
                {/* Header */}
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={0.75}>
                        <HistoryIcon color="action" sx={{ fontSize: 16 }} />
                        <StyledTypography variant="subtitle2" fontWeight={600} color="text.secondary">
                            {t("pages.admin.tgAccounts.broadcast.history.title")}
                        </StyledTypography>
                        <Chip size="small" label={history.length} sx={{ height: 18, fontSize: 10 }} />
                    </Box>
                    <Tooltip title={t("pages.admin.tgAccounts.broadcast.history.clearAll")}>
                        <span>
                            <IconButton size="small" color="error" onClick={handleClearAll} disabled={isDeletingAll}>
                                {isDeletingAll
                                    ? <CircularProgress size={16} color="error" />
                                    : <DeleteSweepIcon sx={{ fontSize: 18 }} />}
                            </IconButton>
                        </span>
                    </Tooltip>
                </Box>

                {/* Scrollable list */}
                <Box
                    display="flex"
                    flexDirection="column"
                    gap={0.75}
                    sx={{ maxHeight: 320, overflowY: "auto", pr: 0.5 }}
                >
                    {history.map((run) => (
                        <RunCard
                            key={run.id}
                            accountId={accountId}
                            run={run}
                            onDelete={handleDelete}
                            isDeleting={isDeleting && deletingId === run.id}
                        />
                    ))}
                </Box>

                <Divider />
            </Box>
        </>
    );
}
