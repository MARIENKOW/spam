"use client";

import { StyledTypography } from "@/components/ui/StyledTypography";
import { StyledButton } from "@/components/ui/StyledButton";
import { TriStateCheckbox } from "@/components/features/form/fields/uncontrolled/TriStateCheckbox";
import { DatePickerComponent } from "@/components/features/form/fields/uncontrolled/DatePickerComponent";
import { BlogParams, defaultBlogParams } from "@/lib/tanstack/listDefaults";
import { Box, Chip } from "@mui/material";
import { useTranslations } from "next-intl";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import CloseIcon from "@mui/icons-material/Close";
import { StyledDrawer } from "@/components/ui/StyledDrawer";
import { StyledIconButton } from "@/components/ui/StyledIconButton";
import { StyledDivider } from "@/components/ui/StyledDivider";
import { StyledChip } from "@/components/ui/StyledChip";

type Filters = Omit<BlogParams, "page">;

interface BlogFiltersDrawerProps {
    open: boolean;
    onClose: () => void;
    filters: Filters;
    setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
    resetFilters: () => void;
}

export function BlogFiltersDrawer({
    open,
    onClose,
    filters,
    setFilter,
    resetFilters,
}: BlogFiltersDrawerProps) {
    const t = useTranslations();

    return (
        <StyledDrawer anchor="right" open={open} onClose={onClose}>
            <Box
                sx={{ width: 300, p: 2 }}
                display="flex"
                flexDirection="column"
                gap={2}
            >
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <StyledTypography variant="h6" fontWeight={600}>
                        {t("common.filters")}
                    </StyledTypography>
                    <StyledIconButton size="small" onClick={onClose}>
                        <CloseIcon />
                    </StyledIconButton>
                </Box>

                <StyledDivider />
                <Box display={"flex"} justifyContent={"center"}>
                    <StyledChip
                        icon={
                            filters.order === "desc" ? (
                                <ArrowDownwardIcon />
                            ) : (
                                <ArrowUpwardIcon />
                            )
                        }
                        label={t(
                            filters.order === "desc"
                                ? "common.sortNewest"
                                : "common.sortOldest",
                        )}
                        onClick={() =>
                            setFilter(
                                "order",
                                filters.order === "desc" ? "asc" : "desc",
                            )
                        }
                        color="primary"
                        variant="outlined"
                        size="small"
                        sx={{ alignSelf: "flex-start" }}
                    />
                </Box>
                <StyledDivider />

                <Box display="flex" flexDirection="column" gap={1}>
                    <TriStateCheckbox
                        value={filters.short}
                        onChange={(v) => setFilter("short", v)}
                        label={t("pages.admin.blog.filter.short.label")}
                    />
                    <TriStateCheckbox
                        value={filters.important}
                        onChange={(v) => setFilter("important", v)}
                        label={t("pages.admin.blog.filter.important.label")}
                    />
                </Box>

                <StyledDivider />

                <Box display="flex" flexDirection="column" gap={2}>
                    <DatePickerComponent
                        value={
                            filters.dateFrom ? new Date(filters.dateFrom) : null
                        }
                        onChange={(d) =>
                            setFilter(
                                "dateFrom",
                                d ? (d as Date).toISOString() : "",
                            )
                        }
                        label={t("pages.admin.blog.filter.dateFrom")}
                        slotProps={{
                            textField: { size: "small", fullWidth: true },
                            field: { clearable: true },
                        }}
                    />
                    <DatePickerComponent
                        value={filters.dateTo ? new Date(filters.dateTo) : null}
                        onChange={(d) =>
                            setFilter(
                                "dateTo",
                                d ? (d as Date).toISOString() : "",
                            )
                        }
                        label={t("pages.admin.blog.filter.dateTo")}
                        slotProps={{
                            textField: { size: "small", fullWidth: true },
                            field: { clearable: true },
                        }}
                    />
                </Box>

                <StyledDivider />

                <StyledButton variant="contained" onClick={resetFilters}>
                    {t("common.resetFilters")}
                </StyledButton>
            </Box>
        </StyledDrawer>
    );
}
