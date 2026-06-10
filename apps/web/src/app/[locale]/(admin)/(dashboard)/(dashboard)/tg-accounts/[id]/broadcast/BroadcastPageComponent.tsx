"use client";

import { useBroadcast } from "@/hooks/tanstack/useBroadcast";
import { Box, CircularProgress } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { broadcastKeys } from "@/lib/tanstack/keys";
import ErrorHandlerElement from "@/components/feedback/error/ErrorHandlerElement";
import BroadcastDraftView from "@/app/[locale]/(admin)/(dashboard)/(dashboard)/tg-accounts/[id]/broadcast/BroadcastDraftView";
import BroadcastRunningView from "@/app/[locale]/(admin)/(dashboard)/(dashboard)/tg-accounts/[id]/broadcast/BroadcastRunningView";
import { BroadcastHistory } from "@/app/[locale]/(admin)/(dashboard)/(dashboard)/tg-accounts/[id]/broadcast/BroadcastHistory";
import AccountBreadcrumbs from "@/components/features/Breadcrumbs/AccountBreadcrumbs";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";
import { useTranslations } from "next-intl";

interface Props {
    accountId: string;
}

export default function BroadcastPageComponent({ accountId }: Props) {
    const t = useTranslations();
    const queryClient = useQueryClient();
    const { data, isLoading, error } = useBroadcast(accountId);
    const breadcrumbs = <AccountBreadcrumbs accountId={accountId} extra={[{ name: t("pages.admin.tgAccounts.broadcast.name"), href: `${FULL_PATH_ROUTE.admin.tgAccounts.path}/${accountId}/broadcast` }]} />;

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" py={8}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <ErrorHandlerElement
                error={error}
                reset={() => queryClient.invalidateQueries({ queryKey: broadcastKeys.all(accountId) })}
            />
        );
    }

    if (!data) return null;

    const historySection = <BroadcastHistory accountId={accountId} />;

    if (data.status === "RUNNING") {
        return (
            <Box display="flex" flexDirection="column" gap={3}>
                {breadcrumbs}
                {historySection}
                <BroadcastRunningView accountId={accountId} broadcast={data} />
            </Box>
        );
    }

    return (
        <Box display="flex" flexDirection="column" gap={3}>
            {breadcrumbs}
            {historySection}
            <BroadcastDraftView accountId={accountId} broadcast={data} />
        </Box>
    );
}
