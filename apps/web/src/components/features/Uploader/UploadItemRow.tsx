"use client";

import { useMemo } from "react";
import {
    Box,
    Typography,
    Stack,
    Paper,
    LinearProgress,
    CircularProgress,
    IconButton,
    Chip,
    Tooltip,
    useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VideoFileIcon from "@mui/icons-material/VideoFile"; // default fallback
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import CancelIcon from "@mui/icons-material/Cancel";
import BlockIcon from "@mui/icons-material/Block";
import { formatBytes } from "@myorg/shared/utils";
import { useTranslations } from "next-intl";
import { UploadItem, UploadStatus } from "@/components/features/Uploader/types";
import { StyledPaper } from "@/components/ui/StyledPaper";
import { StyledTypography } from "@/components/ui/StyledTypography";
import { StyledChip } from "@/components/ui/StyledChip";
import { StyledTooltip } from "@/components/ui/StyledTooltip";
import { StyledIconButton } from "@/components/ui/StyledIconButton";

const isCancellable = (s: UploadStatus) => s === "waiting" || s === "uploading";
const isFinished = (s: UploadStatus) =>
    s === "done" || s === "error" || s === "cancelled";

interface UploadItemRowProps {
    item: UploadItem;
    onRemove: (id: string) => void;
    onCancel: (id: string) => void;
    fileIcon?: (color: string) => React.ReactNode;
}

export function UploadItemRow({
    item,
    onRemove,
    onCancel,
    fileIcon,
}: UploadItemRowProps) {
    const theme = useTheme();
    const vars = theme.vars!;
    const t = useTranslations();

    const cfgMap = useMemo<
        Record<
            UploadStatus,
            {
                color: string;
                channel: string;
                icon: React.ReactNode;
                label: string;
                chip: "default" | "info" | "success" | "error";
                bar: "inherit" | "info" | "success" | "error";
            }
        >
    >(
        () => ({
            waiting: {
                color: theme.palette.text.disabled,
                channel: vars.palette.text.secondaryChannel,
                icon: <HourglassTopIcon sx={{ fontSize: 14 }} />,
                label: t("uploader.statusWaiting"),
                chip: "default",
                bar: "inherit",
            },
            uploading: {
                color: theme.palette.info.main,
                channel: vars.palette.info.mainChannel,
                icon: (
                    <CircularProgress
                        size={10}
                        sx={{ color: theme.palette.info.main }}
                    />
                ),
                label: `${item.progress}%`,
                chip: "info",
                bar: "info",
            },
            done: {
                color: theme.palette.success.main,
                channel: vars.palette.success.mainChannel,
                icon: <CheckCircleIcon sx={{ fontSize: 14 }} />,
                label: t("uploader.statusDone"),
                chip: "success",
                bar: "success",
            },
            error: {
                color: theme.palette.error.main,
                channel: vars.palette.error.mainChannel,
                icon: <ErrorIcon sx={{ fontSize: 14 }} />,
                label: t("uploader.statusError"),
                chip: "error",
                bar: "error",
            },
            cancelled: {
                color: theme.palette.text.disabled,
                channel: vars.palette.text.secondaryChannel,
                icon: <BlockIcon sx={{ fontSize: 14 }} />,
                label: t("uploader.statusCancelled"),
                chip: "default",
                bar: "inherit",
            },
        }),
        [theme, vars, item.progress, item.status, t],
    );

    const cfg = cfgMap[item.status];

    return (
        <StyledPaper
            variant="outlined"
            sx={{
                p: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                borderColor: `rgba(${cfg.channel} / 0.25)`,
                bgcolor: `rgba(${cfg.channel} / 0.04)`,
                opacity: item.status === "cancelled" ? 0.55 : 1,
                transition:
                    "border-color 0.25s, background-color 0.25s, opacity 0.25s",
                animation: "slideIn 0.25s ease",
                "@keyframes slideIn": {
                    from: { opacity: 0, transform: "translateY(-6px)" },
                    to: { opacity: 1, transform: "translateY(0)" },
                },
            }}
        >
            <Box
                sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 1,
                    flexShrink: 0,
                    bgcolor: `rgba(${cfg.channel} / 0.1)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {fileIcon ? fileIcon(cfg.color) : <VideoFileIcon sx={{ fontSize: 17, color: cfg.color }} />}
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={0.5}
                >
                    <StyledTypography
                        variant="caption"
                        noWrap
                        sx={{
                            color: "text.primary",
                            fontWeight: 500,
                            maxWidth: "58%",
                            display: "block",
                        }}
                    >
                        {item.file.name}
                    </StyledTypography>
                    <StyledChip
                        size="small"
                        color={cfg.chip}
                        icon={<div>{cfg.icon}</div>}
                        label={cfg.label}
                        sx={{
                            height: 20,
                            fontSize: 10,
                            fontWeight: 600,
                            "& .MuiChip-icon": { fontSize: 12, ml: "4px" },
                            "& .MuiChip-label": { px: "6px" },
                        }}
                    />
                </Stack>

                <LinearProgress
                    variant="determinate"
                    value={
                        item.status === "done" || item.status === "error"
                            ? 100
                            : item.progress
                    }
                    color={cfg.bar}
                    sx={{
                        height: 3,
                        borderRadius: 99,
                        bgcolor: `rgba(${cfg.channel} / 0.1)`,
                        "& .MuiLinearProgress-bar": {
                            borderRadius: 99,
                            boxShadow:
                                item.status === "uploading"
                                    ? `0 0 6px rgba(${cfg.channel} / 0.5)`
                                    : "none",
                        },
                    }}
                />

                <StyledTypography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 0.25 }}
                >
                    {formatBytes(item.file.size)}
                    {item.status === "uploading" && item.speed > 0
                        ? ` · ${formatBytes(item.speed)}/s`
                        : ""}
                </StyledTypography>
            </Box>

            {isCancellable(item.status) && (
                <StyledTooltip
                    title={t("uploader.cancel")}
                    placement="left"
                >
                    <StyledIconButton
                        size="small"
                        onClick={() => onCancel(item.id)}
                        sx={{
                            flexShrink: 0,
                            color: "text.secondary",
                            "&:hover": { color: "error.main" },
                            transition: "color 0.2s",
                        }}
                    >
                        <CancelIcon sx={{ fontSize: 16 }} />
                    </StyledIconButton>
                </StyledTooltip>
            )}

            {isFinished(item.status) && (
                <StyledIconButton
                    size="small"
                    onClick={() => onRemove(item.id)}
                    sx={{
                        flexShrink: 0,
                        color: "text.secondary",
                        "&:hover": { color: "text.primary" },
                    }}
                >
                    <CloseIcon sx={{ fontSize: 14 }} />
                </StyledIconButton>
            )}
        </StyledPaper>
    );
}
