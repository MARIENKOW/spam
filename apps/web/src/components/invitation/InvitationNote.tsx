"use client";

import { Box } from "@mui/material";
import { useState } from "react";
import EditNoteIcon from "@mui/icons-material/EditNote";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import { useTranslations } from "next-intl";
import { StyledTypography } from "@/components/ui/StyledTypography";
import { StyledIconButton } from "@/components/ui/StyledIconButton";
import { InvitationNoteForm } from "@/components/invitation/InvitationNoteForm";
import { AdminInvitationDto } from "@myorg/shared/dto";

interface Props {
    inv: AdminInvitationDto;
}

export function InvitationNote({ inv }: Props) {
    const t = useTranslations();
    const [editing, setEditing] = useState(false);

    if (editing) {
        return (
            <InvitationNoteForm inv={inv} onCancel={() => setEditing(false)} />
        );
    }

    if (inv.note) {
        return (
            <Box display="flex" alignItems="flex-start" gap={0.5}>
                <StyledTypography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                        flex: 1,
                        whiteSpace: "pre-wrap",
                        pt: 0.25,
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                        minWidth: 0,
                    }}
                >
                    {inv.note}
                </StyledTypography>
                <StyledIconButton
                    size="small"
                    onClick={() => setEditing(true)}
                    sx={{ flexShrink: 0 }}
                >
                    <EditNoteIcon fontSize="small" />
                </StyledIconButton>
            </Box>
        );
    }

    return (
        <Box
            component="button"
            onClick={() => setEditing(true)}
            sx={{
                cursor: "pointer",
                color: "text.secondary",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                p: 0,
                typography: "caption",
                "&:hover": { color: "text.primary" },
            }}
        >
            <NoteAddIcon fontSize="small" />
            {t("pages.admin.invitation.actions.addNote")}
        </Box>
    );
}
