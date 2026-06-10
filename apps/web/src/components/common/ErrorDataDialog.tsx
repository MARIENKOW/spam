"use client";

import { useState } from "react";
import {
    Box,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Tooltip,
} from "@mui/material";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import CloseIcon from "@mui/icons-material/Close";

interface Props {
    errorData: Record<string, unknown> | null;
}

export function ErrorDataButton({ errorData }: Props) {
    const [open, setOpen] = useState(false);

    if (!errorData) return null;

    return (
        <>
            <Tooltip title="Raw error">
                <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); setOpen(true); }}
                    sx={{ p: 0.25, color: "error.main", opacity: 0.6, "&:hover": { opacity: 1 } }}
                >
                    <BugReportOutlinedIcon sx={{ fontSize: 14 }} />
                </IconButton>
            </Tooltip>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1.5 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <BugReportOutlinedIcon fontSize="small" color="error" />
                        Raw error
                    </Box>
                    <IconButton size="small" onClick={() => setOpen(false)}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ pt: 0 }}>
                    <Box
                        component="pre"
                        sx={{
                            m: 0,
                            p: 1.5,
                            borderRadius: 1,
                            bgcolor: "action.hover",
                            fontSize: 12,
                            fontFamily: "monospace",
                            overflowX: "auto",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-all",
                        }}
                    >
                        {JSON.stringify(errorData, null, 2)}
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
}
