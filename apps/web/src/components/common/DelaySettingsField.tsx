"use client";

import { Box, InputAdornment } from "@mui/material";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import { useEffect, useRef, useState } from "react";
import { StyledTextField } from "@/components/ui/StyledTextField";
import { StyledTypography } from "@/components/ui/StyledTypography";

interface Labels {
    title: string;
    base: string;
    jitter: string;
    minutes: string;
}

interface Props {
    baseSeconds: number;
    jitterSeconds: number;
    onSave: (baseSeconds: number, jitterSeconds: number) => void;
    labels: Labels;
    disabled?: boolean;
}

function secondsToMinutes(seconds: number): string {
    return (Math.round((seconds / 60) * 100) / 100).toString();
}

function minutesToSeconds(minutes: string): number | null {
    const n = parseFloat(minutes.replace(",", "."));
    if (!Number.isFinite(n) || n < 0) return null;
    return Math.round(n * 60);
}

export function DelaySettingsField({ baseSeconds, jitterSeconds, onSave, labels, disabled }: Props) {
    const [base, setBase] = useState(() => secondsToMinutes(baseSeconds));
    const [jitter, setJitter] = useState(() => secondsToMinutes(jitterSeconds));
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const baseSec = minutesToSeconds(base);
            const jitterSec = minutesToSeconds(jitter);
            if (baseSec === null || jitterSec === null) return;
            onSave(baseSec, jitterSec);
        }, 800);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [base, jitter]);

    return (
        <Box>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
                <TimerOutlinedIcon color="action" fontSize="small" />
                <StyledTypography variant="subtitle2" color="text.secondary">
                    {labels.title}
                </StyledTypography>
            </Box>
            <Box display="flex" gap={1.5}>
                <StyledTextField
                    label={labels.base}
                    size="small"
                    type="number"
                    value={base}
                    onChange={(e) => setBase(e.target.value)}
                    disabled={disabled}
                    slotProps={{
                        input: {
                            endAdornment: <InputAdornment position="end">{labels.minutes}</InputAdornment>,
                        },
                        htmlInput: { min: 0, step: 0.5 },
                    }}
                    sx={{ flex: 1 }}
                />
                <StyledTextField
                    label={labels.jitter}
                    size="small"
                    type="number"
                    value={jitter}
                    onChange={(e) => setJitter(e.target.value)}
                    disabled={disabled}
                    slotProps={{
                        input: {
                            endAdornment: <InputAdornment position="end">{labels.minutes}</InputAdornment>,
                        },
                        htmlInput: { min: 0, step: 0.5 },
                    }}
                    sx={{ flex: 1 }}
                />
            </Box>
        </Box>
    );
}
