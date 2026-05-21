"use client";

import { useBroadcastRecipients } from "@/hooks/tanstack/useBroadcast";
import { BroadcastRecipientDto } from "@myorg/shared/dto";
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
import SendIcon from "@mui/icons-material/Send";
import ErrorIcon from "@mui/icons-material/Error";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { StyledTypography } from "@/components/ui/StyledTypography";
import { PaginationComponent } from "@/components/common/PaginationComponent";
import { ClientDate } from "@/components/common/ClientDate";
import { relativeTime } from "@myorg/shared/utils";

interface Props {
    accountId: string;
    sent: number;
    failed: number;
    pending: number;
    isRunning: boolean;
}

const LIMIT = 20;

function RecipientItem({ r }: { r: BroadcastRecipientDto }) {
    const displayName =
        [r.firstName, r.lastName].filter(Boolean).join(" ") ||
        (r.username ? `@${r.username}` : r.userId);

    const borderColor =
        r.status === "SENT" ? "success.main" : "error.main";
    const bgColor =
        r.status === "SENT" ? "success.main" : "error.main";

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
            <Avatar
                sx={{
                    width: 34,
                    height: 34,
                    fontSize: 13,
                    bgcolor: bgColor,
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
                    <StyledTypography
                        variant="caption"
                        color="error.main"
                        noWrap
                        display="block"
                    >
                        {r.errorMessage}
                    </StyledTypography>
                )}
                {r.status === "SENT" && r.username && (
                    <StyledTypography variant="caption" color="text.disabled" noWrap display="block">
                        @{r.username}
                    </StyledTypography>
                )}
            </Box>

            <Box display="flex" flexDirection="column" alignItems="flex-end" flexShrink={0} gap={0.25}>
                {r.status === "SENT" ? (
                    <CheckCircleOutlineIcon sx={{ fontSize: 18, color: "success.main" }} />
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
                    {t("pages.admin.tgAccounts.broadcast.status.RUNNING")}...
                </StyledTypography>
                <StyledTypography variant="caption" color="text.disabled">
                    {t("pages.admin.tgAccounts.broadcast.recipients.listTitle")}
                </StyledTypography>
            </Box>
        </Box>
    );
}

export function RecipientFeed({ accountId, sent, failed, pending, isRunning }: Props) {
    const t = useTranslations();
    const [page, setPage] = useState(1);

    const { data } = useBroadcastRecipients(
        accountId,
        { page, limit: LIMIT, status: "PROCESSED" },
        true,
        isRunning,
    );

    const total = sent + failed;

    return (
        <Box display="flex" flexDirection="column" gap={2}>
            <Box display="flex" flexWrap="wrap" gap={1}>
                <Chip
                    size="small"
                    icon={<SendIcon sx={{ fontSize: "14px !important" }} />}
                    label={`${sent} ${t("pages.admin.tgAccounts.broadcast.summary.sent").toLowerCase()}`}
                    color="success"
                    variant={sent > 0 ? "filled" : "outlined"}
                />
                <Chip
                    size="small"
                    icon={<ErrorIcon sx={{ fontSize: "14px !important" }} />}
                    label={`${failed} ${t("pages.admin.tgAccounts.broadcast.summary.failed").toLowerCase()}`}
                    color={failed > 0 ? "error" : "default"}
                    variant={failed > 0 ? "filled" : "outlined"}
                />
                {pending > 0 && (
                    <Chip
                        size="small"
                        icon={<CircularProgress size={12} color="inherit" />}
                        label={`${pending} ${t("pages.admin.tgAccounts.broadcast.recipients.listTitle").toLowerCase()}`}
                        color="info"
                        variant="outlined"
                    />
                )}
            </Box>

            {(isRunning || (data && data.data.length > 0)) && (
                <Box display="flex" flexDirection="column" gap={0.75}>
                    {isRunning && pending > 0 && <ActiveItem />}

                    {data && data.data.length > 0 && (
                        <>
                            {isRunning && pending > 0 && data.data.length > 0 && (
                                <Divider sx={{ my: 0.5 }} />
                            )}
                            {data.data.map((r) => (
                                <RecipientItem key={r.id} r={r} />
                            ))}
                        </>
                    )}
                </Box>
            )}

            {data && data.data.length === 0 && !isRunning && (
                <Typography variant="body2" color="text.disabled">
                    {t("pages.admin.tgAccounts.broadcast.recipients.empty")}
                </Typography>
            )}

            {data && data.meta.pageCount > 1 && (
                <PaginationComponent
                    page={page}
                    count={data.meta.pageCount}
                    onChange={(p) => { setPage(p); }}
                />
            )}
        </Box>
    );
}
