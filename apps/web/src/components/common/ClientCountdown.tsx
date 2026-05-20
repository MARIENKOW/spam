"use client";

import { TypographyProps } from "@mui/material";
import { StyledTypography } from "@/components/ui/StyledTypography";
import { useCountdown } from "@/hooks/useCountdown";

interface ClientCountdownProps extends TypographyProps {
    expiresAt: string;
    formatLabel?: (duration: string) => string;
}

export function ClientCountdown({ expiresAt, formatLabel, ...rest }: ClientCountdownProps) {
    const { label } = useCountdown(expiresAt);

    return <StyledTypography {...rest}>{formatLabel ? formatLabel(label) : label}</StyledTypography>;
}
