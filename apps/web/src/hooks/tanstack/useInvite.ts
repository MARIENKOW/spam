"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { inviteKeys } from "@/lib/tanstack/keys";
import InviteService from "@/services/invite/invite.service";
import { $apiAdminClient } from "@/utils/api/admin/fetch.admin.client";

const service = new InviteService($apiAdminClient);

export function useInvite(accountId: string) {
    return useQuery({
        queryKey: inviteKeys.detail(accountId),
        queryFn: () => service.get(accountId).then((r) => r.data),
        enabled: !!accountId,
        refetchInterval: (query) => {
            const data = query.state.data;
            if (!data) return false;
            if (data.status === "RUNNING") return 5_000;
            if (data.channels.some((c) => c.recipientCount === null && !c.fetchError)) return 3_000;
            return false;
        },
    });
}

export function useInviteProgress(accountId: string, enabled: boolean) {
    return useQuery({
        queryKey: inviteKeys.progress(accountId),
        queryFn: () => service.getProgress(accountId).then((r) => r.data),
        enabled: !!accountId && enabled,
        refetchInterval: 5_000,
    });
}

export function useInviteRecipients(
    accountId: string,
    params: { page: number; limit: number; status?: string },
    enabled: boolean,
    poll = false,
) {
    return useQuery({
        queryKey: inviteKeys.recipients(accountId, params),
        queryFn: () => service.getRecipients(accountId, params).then((r) => r.data),
        enabled: !!accountId && enabled,
        refetchInterval: poll ? 5_000 : false,
    });
}

export function useInviteHistory(accountId: string) {
    return useQuery({
        queryKey: inviteKeys.history(accountId),
        queryFn: () => service.getHistory(accountId).then((r) => r.data),
        enabled: !!accountId,
    });
}

export function useInviteRunRecipients(
    accountId: string,
    runId: string,
    params: { page: number; limit: number; status?: string },
    enabled: boolean,
) {
    return useQuery({
        queryKey: inviteKeys.runRecipients(runId, params),
        queryFn: () => service.getRunRecipients(accountId, runId, params).then((r) => r.data),
        enabled: !!accountId && !!runId && enabled,
    });
}

export function useInviteChannelSearch(accountId: string, query: string, enabled: boolean) {
    return useQuery({
        queryKey: inviteKeys.channelSearch(accountId, query),
        queryFn: () => service.searchChannels(accountId, { query }).then((r) => r.data),
        enabled: !!accountId && enabled && query.trim().length > 0,
        staleTime: 30_000,
    });
}

export function useInviteRun(accountId: string, runId: string) {
    const queryClient = useQueryClient();
    const query = useQuery({
        queryKey: inviteKeys.run(accountId, runId),
        queryFn: () => service.getRun(accountId, runId).then((r) => r.data),
        enabled: !!accountId && !!runId,
        refetchInterval: (query) => {
            const data = query.state.data;
            if (!data) return false;
            return data.status === "RUNNING" ? 5_000 : false;
        },
    });

    useEffect(() => {
        if (query.data?.status === "COMPLETED" || query.data?.status === "STOPPED") {
            queryClient.invalidateQueries({ queryKey: inviteKeys.detail(accountId) });
        }
    }, [query.data?.status, accountId, queryClient]);

    return query;
}
