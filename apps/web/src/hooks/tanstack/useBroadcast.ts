"use client";

import { useQuery } from "@tanstack/react-query";
import { broadcastKeys } from "@/lib/tanstack/keys";
import BroadcastService from "@/services/broadcast/broadcast.service";
import { $apiAdminClient } from "@/utils/api/admin/fetch.admin.client";

const service = new BroadcastService($apiAdminClient);

export function useBroadcast(accountId: string) {
    return useQuery({
        queryKey: broadcastKeys.detail(accountId),
        queryFn: () => service.get(accountId).then((r) => r.data),
        enabled: !!accountId,
        refetchInterval: (query) => {
            const data = query.state.data;
            if (!data) return false;
            if (data.channels.some((c) => c.recipientCount === null)) return 3_000;
            return false;
        },
    });
}

export function useBroadcastProgress(accountId: string, enabled: boolean) {
    return useQuery({
        queryKey: broadcastKeys.progress(accountId),
        queryFn: () => service.getProgress(accountId).then((r) => r.data),
        enabled: !!accountId && enabled,
        refetchInterval: 5_000,
    });
}

export function useBroadcastRecipients(
    accountId: string,
    params: { page: number; limit: number; status?: string },
    enabled: boolean,
    poll = false,
) {
    return useQuery({
        queryKey: broadcastKeys.recipients(accountId, params),
        queryFn: () => service.getRecipients(accountId, params).then((r) => r.data),
        enabled: !!accountId && enabled,
        refetchInterval: poll ? 5_000 : false,
    });
}

export function useBroadcastHistory(accountId: string) {
    return useQuery({
        queryKey: broadcastKeys.history(accountId),
        queryFn: () => service.getHistory(accountId).then((r) => r.data),
        enabled: !!accountId,
    });
}

export function useBroadcastRunRecipients(
    accountId: string,
    runId: string,
    params: { page: number; limit: number; status?: string },
    enabled: boolean,
) {
    return useQuery({
        queryKey: broadcastKeys.runRecipients(runId, params),
        queryFn: () => service.getRunRecipients(accountId, runId, params).then((r) => r.data),
        enabled: !!accountId && !!runId && enabled,
    });
}

export function useChannelSearch(accountId: string, query: string, enabled: boolean) {
    return useQuery({
        queryKey: broadcastKeys.channelSearch(accountId, query),
        queryFn: () =>
            service.searchChannels(accountId, { query }).then((r) => r.data),
        enabled: !!accountId && enabled && query.trim().length > 0,
        staleTime: 30_000,
    });
}
