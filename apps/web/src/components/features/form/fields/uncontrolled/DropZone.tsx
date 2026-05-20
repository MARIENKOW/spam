"use client";

import { useRef, useState } from "react";
import { Box, useTheme } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useTranslations } from "next-intl";
import { StyledPaper } from "@/components/ui/StyledPaper";
import { StyledTypography } from "@/components/ui/StyledTypography";

export interface DropZoneProps {
    accept: string[];
    multiple?: boolean;
    disabled?: boolean;
    labelActive?: string;
    labelIdle?: string;
    sublabel?: string;
    onFiles: (files: File[]) => void;
    error?: boolean;
}

export function DropZone({
    onFiles,
    accept = [],
    multiple = false,
    disabled = false,
    labelActive,
    error,
    labelIdle,
    sublabel,
}: DropZoneProps) {
    const theme = useTheme();
    const vars = theme.vars!;
    const t = useTranslations();
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);

    const filter = (files: File[]) => {
        if (!accept.length) return files;
        return files.filter((f) =>
            accept.some((type) =>
                type.endsWith("/*")
                    ? f.type.startsWith(type.replace("/*", "/"))
                    : f.type === type,
            ),
        );
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        if (disabled) return;
        const filtered = filter(Array.from(e.dataTransfer.files));
        if (filtered.length) onFiles(filtered);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const filtered = filter(Array.from(e.target.files ?? []));
        if (filtered.length) onFiles(filtered);
        e.target.value = "";
    };

    return (
        <StyledPaper
            variant="outlined"
            onDragOver={(e) => {
                e.preventDefault();
                if (!disabled) setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => {
                if (!disabled) inputRef.current?.click();
            }}
            sx={{
                p: 3,
                display: "flex",
                flexDirection: "column",
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                gap: 1.5,
                borderRadius: 2,
                cursor: disabled ? "default" : "pointer",
                borderStyle: "dashed",
                opacity: disabled ? 0.5 : 1,
                borderColor: error
                    ? "error.main"
                    : dragging
                      ? "primary.main"
                      : "divider",
                bgcolor: dragging
                    ? `rgba(${vars.palette.primary.mainChannel} / 0.05)`
                    : "background.paper",
                transform: dragging ? "scale(1.01)" : "scale(1)",
                transition: "all 0.2s ease",
                boxShadow: dragging
                    ? `0 0 20px rgba(${vars.palette.primary.mainChannel} / 0.12)`
                    : "none",
                ...(!disabled && {
                    "&:hover": {
                        borderColor: error ? "error.main" : "primary.light",
                        bgcolor: `rgba(${vars.palette.primary.mainChannel} / 0.09)`,
                    },
                }),
            }}
        >
            <input
                ref={inputRef}
                type="file"
                accept={accept.join(",")}
                multiple={multiple}
                disabled={disabled}
                style={{ display: "none" }}
                onChange={handleChange}
            />
            <Box
                sx={{
                    width: 52,
                    height: 52,
                    borderRadius: 2,
                    bgcolor: dragging
                        ? `rgba(${vars.palette.primary.mainChannel} / 0.1)`
                        : `rgba(${vars.palette.action.activeChannel} / 0.04)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s ease",
                }}
            >
                <CloudUploadIcon
                    sx={{
                        fontSize: 26,
                        color: error
                            ? "error.main"
                            : dragging
                              ? "primary.main"
                              : "text.disabled",
                        transition: "color 0.2s",
                    }}
                />
            </Box>
            <Box textAlign="center">
                <StyledTypography
                    variant="body2"
                    color={dragging ? "primary" : "text.secondary"}
                    fontWeight={500}
                >
                    {dragging
                        ? (labelActive ?? t("form.dropzone.dropActive"))
                        : (labelIdle ?? t("form.dropzone.dropIdle"))}
                </StyledTypography>
                {sublabel && (
                    <StyledTypography variant="caption" color="text.disabled">
                        {sublabel}
                    </StyledTypography>
                )}
            </Box>
        </StyledPaper>
    );
}
