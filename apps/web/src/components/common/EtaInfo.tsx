"use client";

import { Box, SxProps, Theme } from "@mui/material";
import ScheduleIcon from "@mui/icons-material/Schedule";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import { ClientCountdown } from "@/components/common/ClientCountdown";

interface Labels {
    // `time` is the formatted countdown ("" once it reaches zero — render the "soon" copy then).
    nextAttempt: (time: string) => string;
    finish: (time: string) => string;
}

interface Props {
    nextAttemptAt: string | null;
    estimatedFinishAt: string | null;
    labels: Labels;
    compact?: boolean;
    sx?: SxProps<Theme>;
}

export function EtaInfo({ nextAttemptAt, estimatedFinishAt, labels, compact, sx }: Props) {
    if (!nextAttemptAt && !estimatedFinishAt) return null;

    const size = compact ? 12 : 14;
    const variant = compact ? "caption" : "body2";

    return (
        <Box display="flex" flexDirection="column" gap={0.25} sx={sx}>
            {nextAttemptAt && (
                <Box display="flex" alignItems="center" gap={0.5}>
                    <ScheduleIcon sx={{ fontSize: size }} color="action" />
                    <ClientCountdown
                        expiresAt={nextAttemptAt}
                        formatLabel={labels.nextAttempt}
                        variant={variant}
                        color="text.secondary"
                    />
                </Box>
            )}
            {estimatedFinishAt && (
                <Box display="flex" alignItems="center" gap={0.5}>
                    <FlagOutlinedIcon sx={{ fontSize: size }} color="action" />
                    <ClientCountdown
                        expiresAt={estimatedFinishAt}
                        formatLabel={labels.finish}
                        variant={variant}
                        color="text.secondary"
                    />
                </Box>
            )}
        </Box>
    );
}
