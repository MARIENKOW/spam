"use client";

import { useBroadcast } from "@/hooks/tanstack/useBroadcast";
import { Box, CircularProgress } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { broadcastKeys } from "@/lib/tanstack/keys";
import ErrorHandlerElement from "@/components/feedback/error/ErrorHandlerElement";
import BroadcastDraftView from "@/app/[locale]/(admin)/(dashboard)/(dashboard)/tg-accounts/[id]/broadcast/BroadcastDraftView";
import BroadcastRunningView from "@/app/[locale]/(admin)/(dashboard)/(dashboard)/tg-accounts/[id]/broadcast/BroadcastRunningView";
import { BroadcastHistory } from "@/app/[locale]/(admin)/(dashboard)/(dashboard)/tg-accounts/[id]/broadcast/BroadcastHistory";

interface Props {
    accountId: string;
}

export default function BroadcastPageComponent({ accountId }: Props) {
    const queryClient = useQueryClient();
    const { data, isLoading, error } = useBroadcast(accountId);

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
                {historySection}
                <BroadcastRunningView accountId={accountId} broadcast={data} />
            </Box>
        );
    }

    return (
        <Box display="flex" flexDirection="column" gap={3}>
            {historySection}
            <BroadcastDraftView accountId={accountId} broadcast={data} />
        </Box>
    );
}
