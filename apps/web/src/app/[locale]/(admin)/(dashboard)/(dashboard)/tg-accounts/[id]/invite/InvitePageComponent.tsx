"use client";

import { useInvite } from "@/hooks/tanstack/useInvite";
import { Box, CircularProgress } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@/i18n/navigation";
import { useEffect } from "react";
import { inviteKeys } from "@/lib/tanstack/keys";
import ErrorHandlerElement from "@/components/feedback/error/ErrorHandlerElement";
import InviteDraftView from "@/app/[locale]/(admin)/(dashboard)/(dashboard)/tg-accounts/[id]/invite/InviteDraftView";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";

interface Props {
    accountId: string;
}

export default function InvitePageComponent({ accountId }: Props) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const { data, isLoading, isFetching, error } = useInvite(accountId);

    useEffect(() => {
        if (!isFetching && data?.status === "RUNNING" && data.currentRunId) {
            router.replace(
                `${FULL_PATH_ROUTE.admin.tgAccounts.path}/${accountId}/invite/${data.currentRunId}`,
            );
        }
    }, [data?.status, data?.currentRunId, isFetching, accountId, router]);

    if (isLoading || (isFetching && (!data || data.status === "RUNNING"))) {
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
                reset={() => queryClient.invalidateQueries({ queryKey: inviteKeys.all(accountId) })}
            />
        );
    }

    if (!data) return null;

    if (data.status === "RUNNING") return null;

    return <InviteDraftView accountId={accountId} invite={data} />;
}
