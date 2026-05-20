"use client";

import { InputAdornment } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import { snackbarSuccess } from "@/utils/snackbar/snackbar.success";
import { StyledOutlinedInput } from "@/components/ui/StyledOutlinedInput";
import { StyledIconButton } from "@/components/ui/StyledIconButton";

interface Props {
    value: string;
    successMessage: string;
    disabled?: boolean;
}

export function CopyToClipboard({ value, successMessage, disabled }: Props) {
    const [copied, setCopied] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const handleCopy = async () => {
        if (!value || disabled) return;

        try {
            await navigator.clipboard.writeText(value);
        } catch {
            // Fallback for HTTP or browsers without clipboard API
            try {
                const ta = document.createElement("textarea");
                ta.value = value;
                ta.style.position = "fixed";
                ta.style.opacity = "0";
                document.body.appendChild(ta);
                ta.focus();
                ta.select();
                document.execCommand("copy");
                document.body.removeChild(ta);
            } catch {
                return; // Copying genuinely failed — don't show success
            }
        }

        setCopied(true);
        snackbarSuccess(successMessage);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopied(false), 2000);
    };

    return (
        <StyledOutlinedInput
            fullWidth
            size="small"
            readOnly
            value={value}
            disabled={disabled}
            onClick={handleCopy}
            sx={{
                cursor: disabled ? "default" : "pointer",
                fontSize: "0.75rem",
                pr: 0.5,
                "& input": { cursor: disabled ? "default" : "pointer" },
            }}
            endAdornment={
                <InputAdornment position="end">
                    <StyledIconButton
                        size="small"
                        edge="end"
                        disabled={disabled}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCopy();
                        }}
                    >
                        {copied ? (
                            <CheckIcon fontSize="small" color="success" />
                        ) : (
                            <ContentCopyIcon fontSize="small" />
                        )}
                    </StyledIconButton>
                </InputAdornment>
            }
        />
    );
}
