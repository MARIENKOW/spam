"use client";

import { useState } from "react";
import { Badge, Box, DialogContent, DialogTitle, LinearProgress } from "@mui/material";
import { useTranslations } from "next-intl";
import RefreshIcon from "@mui/icons-material/Refresh";
import FilterListIcon from "@mui/icons-material/FilterList";
import { StyledButton } from "@/components/ui/StyledButton";
import { StyledIconButton } from "@/components/ui/StyledIconButton";
import { StyledTypography } from "@/components/ui/StyledTypography";
import { StyledTooltip } from "@/components/ui/StyledTooltip";
import { StyledDialog } from "@/components/ui/StyledDialog";
import { useAdminInvitations, defaultInvitationParams } from "@/hooks/tanstack/useAdminInvitations";
import { usePageClamp } from "@/hooks/tanstack/usePageClamp";
import AdminInvitationCreateForm from "@/components/form/AdminInvitationCreateForm";
import { InvitationList } from "@/app/[locale]/admin/(dashboard)/(dashboard)/invitations/InvitationList";
import { PaginationComponent } from "@/components/common/PaginationComponent";
import { SearchField } from "@/components/common/SearchField";
import { useUrlListState } from "@/hooks/tanstack/useUrlListState";
import { InvitationFiltersDrawer } from "@/app/[locale]/admin/(dashboard)/(dashboard)/invitations/InvitationFiltersDrawer";

export default function InvitationComponent() {
    const t = useTranslations();
    const { page, setPage, filters, setFilter, resetFilters } = useUrlListState(defaultInvitationParams);
    const { data, isFetching, error, refetch } = useAdminInvitations({ page, ...filters });
    usePageClamp(page, data?.meta.pageCount, setPage);
    const [createOpen, setCreateOpen] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(false);

    const activeFilterCount = filters.status !== defaultInvitationParams.status ? 1 : 0;

    return (
        <Box display="flex" flexDirection="column" flex={1} height="100%">
            <InvitationFiltersDrawer
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
                        {t("pages.admin.invitation.name")}
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
                <StyledButton variant="contained" onClick={() => setCreateOpen(true)}>
                    {t("pages.admin.invitation.actions.create")}
                </StyledButton>
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
                <InvitationList data={data?.data} error={error} />
                <PaginationComponent
                    page={page}
                    count={data?.meta.pageCount ?? 1}
                    onChange={setPage}
                    disabled={isFetching}
                />
            </Box>

            <StyledDialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth>
                <DialogTitle sx={{ pb: 1 }}>
                    {t("pages.admin.invitation.form.title")}
                </DialogTitle>
                <DialogContent sx={{ pt: "7px !important" }}>
                    <AdminInvitationCreateForm onCancel={() => setCreateOpen(false)} />
                </DialogContent>
            </StyledDialog>
        </Box>
    );
}
