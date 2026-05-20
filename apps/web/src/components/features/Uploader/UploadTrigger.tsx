"use client";

import {
    Box,
    Typography,
    Paper,
    LinearProgress,
    CircularProgress,
    Tooltip,
    Button,
    useTheme,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { useTranslations } from "next-intl";
import { StyledTypography } from "@/components/ui/StyledTypography";
import { StyledPaper } from "@/components/ui/StyledPaper";
import { StyledTooltip } from "@/components/ui/StyledTooltip";
import { StyledButton } from "@/components/ui/StyledButton";

interface UploadTriggerProps {
    onClick: () => void;
    total: number;
    done: number;
    errors: number;
    activeCount: number;
    waiting: number;
    avgProgress: number;
    triggerLabel: string;
}

export function UploadTrigger({
    onClick,
    total,
    done,
    errors,
    activeCount,
    waiting,
    avgProgress,
    triggerLabel,
}: UploadTriggerProps) {
    const theme = useTheme();
    const vars = theme.vars!;
    const t = useTranslations();

    const busy = activeCount > 0 || waiting > 0;
    const allDone = total > 0 && done === total && errors === 0;
    const hasError = errors > 0 && !busy;
    const tone = allDone ? "success" : hasError ? "error" : "info";
    const c = theme.palette[tone];
    const channel = vars.palette[tone].mainChannel;

    if (total === 0) {
        return (
            <StyledButton
                variant="contained"
                startIcon={<CloudUploadIcon />}
                onClick={onClick}
                sx={{ borderRadius: 2, fontWeight: 600, px: 2.5 }}
            >
                {triggerLabel}
            </StyledButton>
        );
    }

    return (
        <StyledTooltip title={t("uploader.openQueue")} placement="bottom">
            <StyledPaper
                variant="outlined"
                onClick={onClick}
                sx={{
                    px: 1.5,
                    py: 0.75,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1.5,
                    cursor: "pointer",
                    borderRadius: 2,
                    borderColor: `rgba(${channel} / 0.3)`,
                    bgcolor: `rgba(${channel} / 0.07)`,
                    userSelect: "none",
                    transition: "all 0.2s ease",
                    "&:hover": {
                        borderColor: c.main,
                        bgcolor: `rgba(${channel} / 0.13)`,
                    },
                }}
            >
                <Box
                    sx={{
                        width: 30,
                        height: 30,
                        borderRadius: 1,
                        flexShrink: 0,
                        bgcolor: `rgba(${channel} / 0.12)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {busy ? (
                        <CircularProgress size={14} sx={{ color: c.main }} />
                    ) : allDone ? (
                        <CheckCircleIcon
                            sx={{ fontSize: 16, color: "success.main" }}
                        />
                    ) : (
                        <ErrorIcon sx={{ fontSize: 16, color: "error.main" }} />
                    )}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    <StyledTypography
                        variant="caption"
                        fontWeight={700}
                        color={`${tone}.main`}
                        display="block"
                        lineHeight={1.3}
                        noWrap
                    >
                        {busy
                            ? t("uploader.summaryUploading", {
                                  active: activeCount,
                                  total,
                              })
                            : allDone
                              ? t("uploader.summaryDone", { done })
                              : t("uploader.summaryPartial", {
                                    done,
                                    total,
                                    errors,
                                })}
                    </StyledTypography>
                    <StyledTypography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        lineHeight={1.3}
                        noWrap
                    >
                        {busy
                            ? t("uploader.summaryProgress", {
                                  progress: avgProgress,
                                  waiting,
                              })
                            : t("uploader.summaryOpenHint")}
                    </StyledTypography>
                </Box>
                {busy && (
                    <Box sx={{ width: 44, flexShrink: 0 }}>
                        <LinearProgress
                            variant="determinate"
                            value={(done / total) * 100}
                            color={tone}
                            sx={{
                                height: 3,
                                borderRadius: 99,
                                bgcolor: `rgba(${channel} / 0.15)`,
                                "& .MuiLinearProgress-bar": {
                                    borderRadius: 99,
                                },
                            }}
                        />
                    </Box>
                )}
            </StyledPaper>
        </StyledTooltip>
    );
}
