"use client";

import { BlogList } from "@/app/[locale]/admin/(dashboard)/(dashboard)/blog/BlogList";
import { BlogFiltersDrawer } from "@/app/[locale]/admin/(dashboard)/(dashboard)/blog/BlogFiltersDrawer";
import { SearchField } from "@/components/common/SearchField";
import DeleteAllBlogs from "@/app/[locale]/admin/(dashboard)/(dashboard)/blog/DeleteAllBlogs";
import { PaginationComponent } from "@/components/common/PaginationComponent";
import { StyledButton } from "@/components/ui/StyledButton";
import { StyledIconButton } from "@/components/ui/StyledIconButton";
import { StyledTooltip } from "@/components/ui/StyledTooltip";
import { StyledTypography } from "@/components/ui/StyledTypography";
import { useBlogs, defaultBlogParams } from "@/hooks/tanstack/useBlog";
import { useUrlListState } from "@/hooks/tanstack/useUrlListState";
import { usePageClamp } from "@/hooks/tanstack/usePageClamp";
import { Link } from "@/i18n/navigation";
import { Badge, Box, LinearProgress } from "@mui/material";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";
import { useTranslations } from "next-intl";
import { useState, useMemo } from "react";
import RefreshIcon from "@mui/icons-material/Refresh";
import FilterListIcon from "@mui/icons-material/FilterList";
import { BlogParams } from "@/lib/tanstack/listDefaults";

function countActiveFilters(filters: Omit<BlogParams, "page">): number {
    let count = 0;
    if (filters.short !== "all") count++;
    if (filters.important !== "all") count++;
    if (filters.dateFrom !== "") count++;
    if (filters.dateTo !== "") count++;
    return count;
}


export default function BlogComponent() {
    const t = useTranslations();
    const { page, setPage, filters, setFilter, resetFilters } =
        useUrlListState(defaultBlogParams);
    const { data, isFetching, error, refetch } = useBlogs({ page, ...filters });
    usePageClamp(page, data?.meta.pageCount, setPage);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const activeCount = useMemo(() => countActiveFilters(filters), [filters]);

    return (
        <Box display="flex" flexDirection="column" flex={1} height="100%">
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems={{ xs: "initial", sm: "center" }}
                flexDirection={{ xs: "column", sm: "row" }}
                gap={1}
                mb={2}
            >
                <Box display="flex" alignItems="center" gap={1}>
                    <StyledTypography variant="h5" fontWeight={700}>
                        {t("pages.admin.blog.name")}
                        {data?.meta.total ? ` · ${data?.meta.total}` : ""}
                    </StyledTypography>
                    <StyledTooltip title={t("common.refresh")} placement="top">
                        <span>
                            <StyledIconButton
                                onClick={() => refetch()}
                                loading={isFetching}
                            >
                                <RefreshIcon />
                            </StyledIconButton>
                        </span>
                    </StyledTooltip>
                    <StyledTooltip title={t("common.filters")} placement="top">
                        <span>
                            <StyledIconButton
                                onClick={() => setDrawerOpen(true)}
                                size="small"
                            >
                                <Badge
                                    badgeContent={activeCount}
                                    color="primary"
                                >
                                    <FilterListIcon />
                                </Badge>
                            </StyledIconButton>
                        </span>
                    </StyledTooltip>
                </Box>
                <Box gap={1} display="flex" alignItems="center">
                    {data && data.data.length > 0 && (
                        <Box flex={{ xs: "0 1 50%", sm: "auto" }}>
                            <DeleteAllBlogs />
                        </Box>
                    )}
                    <Box flex={{ xs: "0 1 50%", sm: "auto" }}>
                        <Link
                            style={{ width: "100%" }}
                            href={FULL_PATH_ROUTE.admin.blog.create.path}
                        >
                            <StyledButton fullWidth variant="contained">
                                {t("pages.admin.blog.create.name")}
                            </StyledButton>
                        </Link>
                    </Box>
                </Box>
            </Box>

            <SearchField
                value={filters.query}
                onChange={(v) => setFilter("query", v)}
            />

            <BlogFiltersDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                filters={filters}
                setFilter={setFilter}
                resetFilters={resetFilters}
            />

            <Box
                flex={1}
                display="flex"
                flexDirection="column"
                position="relative"
                gap={2}
                py={2}
            >
                {isFetching && (
                    <LinearProgress
                        sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                        }}
                    />
                )}
                <BlogList data={data?.data} error={error} />
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
