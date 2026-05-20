"use client";

import { useState } from "react";
import { Badge, Box, LinearProgress } from "@mui/material";
import { useTranslations } from "next-intl";
import RefreshIcon from "@mui/icons-material/Refresh";
import FilterListIcon from "@mui/icons-material/FilterList";
import { StyledIconButton } from "@/components/ui/StyledIconButton";
import { StyledTypography } from "@/components/ui/StyledTypography";
import { StyledTooltip } from "@/components/ui/StyledTooltip";
import { useAdmins, defaultAdminParams } from "@/hooks/tanstack/useAdmins";
import { usePageClamp } from "@/hooks/tanstack/usePageClamp";
import { AdminList } from "@/app/[locale]/admin/(dashboard)/(dashboard)/admins/AdminList";
import { PaginationComponent } from "@/components/common/PaginationComponent";
import { SearchField } from "@/components/common/SearchField";
import { useUrlListState } from "@/hooks/tanstack/useUrlListState";
import { AdminFiltersDrawer } from "@/app/[locale]/admin/(dashboard)/(dashboard)/admins/AdminFiltersDrawer";

export default function AdminsComponent() {
    const t = useTranslations();
    const { page, setPage, filters, setFilter, resetFilters } = useUrlListState(defaultAdminParams);
    const { data, isFetching, error, refetch } = useAdmins({ page, ...filters });
    usePageClamp(page, data?.meta.pageCount, setPage);
    const [filtersOpen, setFiltersOpen] = useState(false);

    const activeFilterCount =
        (filters.status !== defaultAdminParams.status ? 1 : 0) +
        (filters.sortBy !== defaultAdminParams.sortBy ? 1 : 0);

    return (
        <Box display="flex" flexDirection="column" flex={1} height="100%">
            <AdminFiltersDrawer
                open={filtersOpen}
                onClose={() => setFiltersOpen(false)}
                filters={filters}
                setFilter={setFilter}
                resetFilters={resetFilters}
            />

            <Box
                display="flex"
                justifyContent="space-between"
                alignItems={{ xs: "initial", sm: "center" }}
                mb={2}
                flexDirection={{ xs: "column", sm: "row" }}
                gap={1}
            >
                <Box display="flex" alignItems="center" gap={1}>
                    <StyledTypography variant="h5" fontWeight={700}>
                        {t("pages.admin.admins.name")}
                        {data?.meta.total ? ` · ${data.meta.total}` : ""}
                    </StyledTypography>
                    <StyledTooltip title={t("common.refresh")} placement="top">
                        <span>
                            <StyledIconButton onClick={() => refetch()} loading={isFetching}>
                                <RefreshIcon />
                            </StyledIconButton>
                        </span>
                    </StyledTooltip>
                    <StyledTooltip title={t("common.filters")} placement="top">
                        <span>
                            <StyledIconButton size="small" onClick={() => setFiltersOpen(true)}>
                                <Badge badgeContent={activeFilterCount} color="primary">
                                    <FilterListIcon />
                                </Badge>
                            </StyledIconButton>
                        </span>
                    </StyledTooltip>
                </Box>
            </Box>

            <Box mb={2}>
                <SearchField
                    value={filters.query}
                    onChange={(v) => setFilter("query", v)}
                />
            </Box>

            <Box flex={1} display="flex" flexDirection="column" position="relative" gap={2} py={2}>
                {isFetching && (
                    <LinearProgress
                        sx={{ position: "absolute", top: 0, left: 0, width: "100%" }}
                    />
                )}
                <AdminList data={data?.data} error={error} />
                <PaginationComponent
                    page={page}
                    count={data?.meta.pageCount ?? 1}
                    onChange={setPage}
                    disabled={isFetching}
                />
            </Box>
        </Box>
    );
}
