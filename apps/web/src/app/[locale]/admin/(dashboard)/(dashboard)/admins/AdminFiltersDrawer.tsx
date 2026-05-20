"use client";

import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useTranslations } from "next-intl";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import CloseIcon from "@mui/icons-material/Close";
import SortIcon from "@mui/icons-material/Sort";
import { StyledDrawer } from "@/components/ui/StyledDrawer";
import { StyledIconButton } from "@/components/ui/StyledIconButton";
import { StyledDivider } from "@/components/ui/StyledDivider";
import { StyledTypography } from "@/components/ui/StyledTypography";
import { StyledButton } from "@/components/ui/StyledButton";
import { AdminParams } from "@/lib/tanstack/listDefaults";

type Filters = Omit<AdminParams, "page">;

interface AdminFiltersDrawerProps {
    open: boolean;
    onClose: () => void;
    filters: Filters;
    setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
    resetFilters: () => void;
}

const STATUS_OPTIONS: { value: AdminParams["status"]; color: "standard" | "success" | "warning" }[] = [
    { value: "all", color: "standard" },
    { value: "active", color: "success" },
    { value: "blocked", color: "warning" },
];
const SORT_BY_OPTIONS: AdminParams["sortBy"][] = ["createdAt", "lastLoginAt", "lastSeenAt"];

export function AdminFiltersDrawer({ open, onClose, filters, setFilter, resetFilters }: AdminFiltersDrawerProps) {
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

                <Box display="flex" flexDirection="column" gap={0.5}>
                    <StyledTypography variant="caption" color="text.secondary" fontWeight={600} sx={{ px: 0.5 }}>
                        {t("pages.admin.admins.filter.sortBy")}
                    </StyledTypography>
                    {SORT_BY_OPTIONS.map((opt) => {
                        const selected = filters.sortBy === opt;
                        return (
                            <Box
                                key={opt}
                                component="button"
                                onClick={() => {
                                    if (selected) {
                                        setFilter("order", filters.order === "desc" ? "asc" : "desc");
                                    } else {
                                        setFilter("sortBy", opt);
                                    }
                                }}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    px: 1.5,
                                    py: 1,
                                    borderRadius: 1,
                                    border: "1px solid",
                                    borderColor: selected ? "primary.main" : "divider",
                                    bgcolor: selected ? "primary.main" : "transparent",
                                    color: selected ? "primary.contrastText" : "text.primary",
                                    cursor: "pointer",
                                    transition: "all 0.15s",
                                    "&:hover": {
                                        borderColor: "primary.main",
                                        bgcolor: selected ? "primary.dark" : "action.hover",
                                    },
                                }}
                            >
                                <StyledTypography variant="body2" color="inherit">
                                    {t(`pages.admin.admins.filter.${opt}`)}
                                </StyledTypography>
                                {selected ? (
                                    filters.order === "desc" ? (
                                        <ArrowDownwardIcon sx={{ fontSize: 16 }} />
                                    ) : (
                                        <ArrowUpwardIcon sx={{ fontSize: 16 }} />
                                    )
                                ) : (
                                    <SortIcon sx={{ fontSize: 16, opacity: 0.3 }} />
                                )}
                            </Box>
                        );
                    })}
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
                                {t(`pages.admin.admins.status.${value}`)}
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
