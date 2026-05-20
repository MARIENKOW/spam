"use client";

import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useTranslations } from "next-intl";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import CloseIcon from "@mui/icons-material/Close";
import { StyledDrawer } from "@/components/ui/StyledDrawer";
import { StyledIconButton } from "@/components/ui/StyledIconButton";
import { StyledDivider } from "@/components/ui/StyledDivider";
import { StyledTypography } from "@/components/ui/StyledTypography";
import { StyledButton } from "@/components/ui/StyledButton";
import { StyledChip } from "@/components/ui/StyledChip";
import { InvitationParams } from "@/lib/tanstack/listDefaults";

type Filters = Omit<InvitationParams, "page">;

interface InvitationFiltersDrawerProps {
    open: boolean;
    onClose: () => void;
    filters: Filters;
    setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
    resetFilters: () => void;
}

const STATUS_OPTIONS: {
    value: InvitationParams["status"];
    color: "standard" | "success" | "warning" | "error";
}[] = [
    { value: "all", color: "standard" },
    { value: "active", color: "success" },
    { value: "expired", color: "warning" },
    { value: "revoked", color: "error" },
];

export function InvitationFiltersDrawer({ open, onClose, filters, setFilter, resetFilters }: InvitationFiltersDrawerProps) {
    const t = useTranslations();

    return (
        <StyledDrawer anchor="right" open={open} onClose={onClose}>
            <Box sx={{ width: 300, p: 2 }} display="flex" flexDirection="column" gap={2}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <StyledTypography variant="h6" fontWeight={600}>
                        {t("common.filters")}
                    </StyledTypography>
                    <StyledIconButton size="small" onClick={onClose}>
                        <CloseIcon />
                    </StyledIconButton>
                </Box>

                <StyledDivider />

                <Box display="flex" justifyContent="center">
                    <StyledChip
                        icon={filters.order === "desc" ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
                        label={t(filters.order === "desc" ? "common.sortNewest" : "common.sortOldest")}
                        onClick={() => setFilter("order", filters.order === "desc" ? "asc" : "desc")}
                        color="primary"
                        variant="outlined"
                        size="small"
                    />
                </Box>

                <StyledDivider />

                <Box display="flex" flexDirection="column" gap={1}>
                    <ToggleButtonGroup
                        value={filters.status}
                        exclusive
                        onChange={(_, v) => { if (v !== null) setFilter("status", v); }}
                        size="small"
                        orientation="vertical"
                        fullWidth
                    >
                        {STATUS_OPTIONS.map(({ value, color }) => (
                            <ToggleButton key={value} value={value} color={color}>
                                {t(`pages.admin.invitation.status.${value}`)}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                </Box>

                <StyledDivider />

                <StyledButton variant="contained" onClick={resetFilters}>
                    {t("common.resetFilters")}
                </StyledButton>
            </Box>
        </StyledDrawer>
    );
}
