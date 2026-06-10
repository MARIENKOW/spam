"use client";

import { useInviteRecipients } from "@/hooks/tanstack/useInvite";
import { InviteRecipientDto } from "@myorg/shared/dto";
import {
    Avatar,
    Box,
    Chip,
    CircularProgress,
    Divider,
    Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { StyledTypography } from "@/components/ui/StyledTypography";
import { PaginationComponent } from "@/components/common/PaginationComponent";
import { ClientDate } from "@/components/common/ClientDate";
import { ErrorDataButton } from "@/components/common/ErrorDataDialog";
import { relativeTime } from "@myorg/shared/utils";

const LIMIT = 20;

interface Props {
    accountId: string;
    sent: number;
    failed: number;
    pending: number;
    isRunning: boolean;
}

function RecipientItem({ r }: { r: InviteRecipientDto }) {
    const displayName =
        [r.firstName, r.lastName].filter(Boolean).join(" ") ||
        (r.username ? `@${r.username}` : r.userId);

    const borderColor = r.status === "SENT" ? "success.main" : r.status === "PENDING" ? "info.main" : "error.main";
    const bgColor = r.status === "SENT" ? "success.main" : r.status === "PENDING" ? "info.main" : "error.main";

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
                transition: "background-color 0.15s",
                "&:hover": { bgcolor: "action.selected" },
            }}
        >
            <Avatar sx={{ width: 34, height: 34, fontSize: 13, bgcolor: bgColor, flexShrink: 0 }}>
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
                {(r.status === "SENT" || r.status === "PENDING") && r.username && (
                    <StyledTypography variant="caption" color="text.disabled" noWrap display="block">
                        @{r.username}
                    </StyledTypography>
                )}
            </Box>
            <Box display="flex" flexDirection="column" alignItems="flex-end" flexShrink={0} gap={0.25}>
                {r.status === "SENT" ? (
                    <CheckCircleOutlineIcon sx={{ fontSize: 18, color: "success.main" }} />
                ) : r.status === "PENDING" ? (
                    <CircularProgress size={18} color="info" />
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

function ActiveItem() {
    const t = useTranslations();
    return (
        <Box
            display="flex"
            alignItems="center"
            gap={1.5}
            py={1.25}
            px={1.5}
            sx={{
                borderLeft: 3,
                borderColor: "info.main",
                borderRadius: "0 8px 8px 0",
                bgcolor: "action.hover",
            }}
        >
            <CircularProgress size={34} thickness={4} color="info" sx={{ flexShrink: 0 }} />
            <Box flex={1} minWidth={0}>
                <StyledTypography variant="body2" fontWeight={500} color="info.main">
                    {t("pages.admin.tgAccounts.invite.status.RUNNING")}...
                </StyledTypography>
            </Box>
        </Box>
    );
}

export function InviteRecipientFeed({ accountId, sent, failed, pending, isRunning }: Props) {
    const t = useTranslations();
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<"SENT" | "FAILED" | "PENDING" | undefined>(undefined);

    const handleFilter = (f: "SENT" | "FAILED" | "PENDING") => {
        setStatusFilter((prev) => (prev === f ? undefined : f));
        setPage(1);
    };

    const queryStatus = statusFilter === "PENDING" ? "PENDING" : statusFilter ?? "PROCESSED";
    const showActiveItem = isRunning && pending > 0;

    const { data } = useInviteRecipients(
        accountId,
        { page, limit: LIMIT, status: queryStatus },
        true,
        isRunning && !statusFilter,
    );

    return (
        <Box display="flex" flexDirection="column" gap={2}>
            <Box display="flex" flexWrap="wrap" gap={1}>
                <Chip
                    size="small"
                    label={t("pages.admin.tgAccounts.invite.filter.all")}
                    variant={!statusFilter ? "filled" : "outlined"}
                    clickable
                    onClick={() => { setStatusFilter(undefined); setPage(1); }}
                    sx={{ height: 24 }}
                />
                <Chip
                    size="small"
                    icon={<CheckCircleOutlineIcon sx={{ fontSize: "14px !important" }} />}
                    label={t("pages.admin.tgAccounts.invite.history.invitedList", { count: sent })}
                    color="success"
                    variant={statusFilter === "SENT" ? "filled" : "outlined"}
                    clickable
                    onClick={() => handleFilter("SENT")}
                    sx={{ height: 24 }}
                />
                <Chip
                    size="small"
                    icon={<ErrorOutlineIcon sx={{ fontSize: "14px !important" }} />}
                    label={t("pages.admin.tgAccounts.invite.history.failedList", { count: failed })}
                    color="error"
                    variant={statusFilter === "FAILED" ? "filled" : "outlined"}
                    clickable
                    onClick={() => handleFilter("FAILED")}
                    sx={{ height: 24 }}
                />
                <Chip
                    size="small"
                    icon={<CircularProgress size={12} color="inherit" />}
                    label={t("pages.admin.tgAccounts.invite.history.pendingList", { count: pending })}
                    color="info"
                    variant={statusFilter === "PENDING" ? "filled" : "outlined"}
                    clickable
                    onClick={() => handleFilter("PENDING")}
                    sx={{ height: 24 }}
                />
            </Box>

            <Box display="flex" flexDirection="column" gap={0.75}>
                {showActiveItem && <ActiveItem />}
                {showActiveItem && data && data.data.length > 0 && <Divider sx={{ my: 0.5 }} />}
                {data?.data.map((r) => <RecipientItem key={r.id} r={r} />)}
                {data?.data.length === 0 && !showActiveItem && (
                    <Typography variant="body2" color="text.disabled" py={1}>
                        {t("pages.admin.tgAccounts.invite.recipients.empty")}
                    </Typography>
                )}
            </Box>

            {data && data.meta.pageCount > 1 && (
                <PaginationComponent page={page} count={data.meta.pageCount} onChange={(p) => setPage(p)} />
            )}
        </Box>
    );
}
