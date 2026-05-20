"use client";

import {
    Box,
    Typography,
    Stack,
    Paper,
    LinearProgress,
    CircularProgress,
    Chip,
    Tooltip,
    useTheme,
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import { useTranslations } from "next-intl";
import { UploadItem } from "@/components/features/Uploader/types";
import { UploadItemRow } from "@/components/features/Uploader/UploadItemRow";
import { StyledPaper } from "@/components/ui/StyledPaper";
import { StyledTypography } from "@/components/ui/StyledTypography";
import { StyledTooltip } from "@/components/ui/StyledTooltip";
import { StyledChip } from "@/components/ui/StyledChip";

interface UploadQueueProps {
    uploads: UploadItem[];
    busy: boolean;
    done: number;
    total: number;
    errors: number;
    cancellableCount: number;
    hasFinished: boolean;
    onRemove: (id: string) => void;
    onCancel: (id: string) => void;
    onCancelAll: () => void;
    onClearFinished: () => void;
    fileIcon?: (color: string) => React.ReactNode;
}

export function UploadQueue({
    uploads,
    busy,
    done,
    total,
    errors,
    cancellableCount,
    hasFinished,
    onRemove,
    onCancel,
    onCancelAll,
    onClearFinished,
    fileIcon,
}: UploadQueueProps) {
    const theme = useTheme();
    const vars = theme.vars!;
    const t = useTranslations();

    return (
        <>
            {busy && total > 0 && (
                <StyledPaper
                    variant="outlined"
                    sx={{
                        p: 1.5,
                        borderColor: `rgba(${vars.palette.info.mainChannel} / 0.3)`,
                        bgcolor: `rgba(${vars.palette.info.mainChannel} / 0.05)`,
                    }}
                >
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={1}
                    >
                        <Stack direction="row" alignItems="center" gap={0.75}>
                            <CircularProgress size={12} color="info" />
                            <Typography
                                variant="caption"
                                color="info.main"
                                fontWeight={600}
                            >
                                {t("uploader.uploading")}
                            </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" gap={1}>
                            <StyledTypography
                                variant="caption"
                                color="text.secondary"
                            >
                                {done} / {total}
                            </StyledTypography>
                            {cancellableCount > 1 && (
                                <StyledTooltip
                                    title={t("uploader.cancelAll", {
                                        count: cancellableCount,
                                    })}
                                    placement="left"
                                >
                                    <StyledChip
                                        label={t("uploader.cancelAll", {
                                            count: cancellableCount,
                                        })}
                                        size="small"
                                        color="error"
                                        variant="outlined"
                                        icon={
                                            <CancelIcon
                                                sx={{
                                                    fontSize: "12px !important",
                                                }}
                                            />
                                        }
                                        onClick={onCancelAll}
                                        sx={{
                                            height: 20,
                                            fontSize: 10,
                                            cursor: "pointer",
                                            "& .MuiChip-label": { px: "6px" },
                                            "& .MuiChip-icon": { ml: "4px" },
                                        }}
                                    />
                                </StyledTooltip>
                            )}
                        </Stack>
                    </Stack>
                    <LinearProgress
                        variant="determinate"
                        value={(done / total) * 100}
                        color="info"
                        sx={{
                            height: 3,
                            borderRadius: 99,
                            "& .MuiLinearProgress-bar": { borderRadius: 99 },
                        }}
                    />
                </StyledPaper>
            )}

            {total > 0 && (
                <Box>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={1}
                    >
                        <Stack direction="row" alignItems="center" gap={0.75}>
                            <StyledTypography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                    textTransform: "uppercase",
                                    letterSpacing: "0.08em",
                                }}
                            >
                                {t("uploader.queueTitle", {
                                    count: total,
                                })}
                            </StyledTypography>
                            {errors > 0 && (
                                <StyledChip
                                    label={t("uploader.errorsCount", {
                                        count: errors,
                                    })}
                                    size="small"
                                    color="error"
                                    sx={{
                                        height: 16,
                                        fontSize: 9,
                                        "& .MuiChip-label": { px: "5px" },
                                    }}
                                />
                            )}
                        </Stack>
                        {!busy && hasFinished && (
                            <StyledTypography
                                variant="caption"
                                color="text.secondary"
                                onClick={onClearFinished}
                                sx={{
                                    cursor: "pointer",
                                    userSelect: "none",
                                    "&:hover": { color: "text.primary" },
                                    transition: "color 0.2s",
                                }}
                            >
                                {t("uploader.clear")}
                            </StyledTypography>
                        )}
                    </Stack>

                    <Stack spacing={1}>
                        {uploads.map((item) => (
                            <UploadItemRow
                                key={item.id}
                                item={item}
                                onRemove={onRemove}
                                onCancel={onCancel}
                                fileIcon={fileIcon}
                            />
                        ))}
                    </Stack>
                </Box>
            )}
        </>
    );
}
