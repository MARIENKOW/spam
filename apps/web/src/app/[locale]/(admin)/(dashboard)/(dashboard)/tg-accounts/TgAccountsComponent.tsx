"use client";

import { TgAccountsList } from "@/app/[locale]/(admin)/(dashboard)/(dashboard)/tg-accounts/TgAccountsList";
import { PaginationComponent } from "@/components/common/PaginationComponent";
import { StyledIconButton } from "@/components/ui/StyledIconButton";
import { StyledTooltip } from "@/components/ui/StyledTooltip";
import { StyledTypography } from "@/components/ui/StyledTypography";
import { StyledButton } from "@/components/ui/StyledButton";
import { useTgAccounts, defaultTgAccountParams } from "@/hooks/tanstack/useTgAccounts";
import { useUrlListState } from "@/hooks/tanstack/useUrlListState";
import { usePageClamp } from "@/hooks/tanstack/usePageClamp";
import { Link } from "@/i18n/navigation";
import { Box, LinearProgress } from "@mui/material";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";
import { useTranslations } from "next-intl";
import RefreshIcon from "@mui/icons-material/Refresh";

export default function TgAccountsComponent() {
    const t = useTranslations();
    const { page, setPage } = useUrlListState(defaultTgAccountParams);
    const { data, isFetching, error, refetch } = useTgAccounts({ page });
    usePageClamp(page, data?.meta.pageCount, setPage);

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
                        {t("pages.admin.tgAccounts.name")}
                        {data?.meta.total ? ` · ${data.meta.total}` : ""}
                    </StyledTypography>
                    <StyledTooltip title={t("common.refresh")} placement="top">
                        <span>
                            <StyledIconButton onClick={() => refetch()} loading={isFetching}>
                                <RefreshIcon />
                            </StyledIconButton>
                        </span>
                    </StyledTooltip>
                </Box>

                <Link href={FULL_PATH_ROUTE.admin.tgAccounts.add.path}>
                    <StyledButton variant="contained">
                        {t("pages.admin.tgAccounts.add.name")}
                    </StyledButton>
                </Link>
            </Box>

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
                        sx={{ position: "absolute", top: 0, left: 0, width: "100%" }}
                    />
                )}
                <TgAccountsList data={data?.data} error={error} />
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
