"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tgAccountKeys } from "@/lib/tanstack/keys";
import TgAccountService from "@/services/tg-account/tg-account.service";
import { $apiAdminClient } from "@/utils/api/admin/fetch.admin.client";

const service = new TgAccountService($apiAdminClient);

export function useTgAccountDetail(id: string) {
    return useQuery({
        queryKey: tgAccountKeys.detail(id),
        queryFn: () => service.getOne(id).then((r) => r.data),
        enabled: !!id,
    });
}

export function useOwnedChannels(id: string) {
    return useQuery({
        queryKey: tgAccountKeys.ownedChannels(id),
        queryFn: () => service.getOwnedChannels(id).then((r) => r.data),
        enabled: !!id,
    });
}

export function useSyncOwnedChannels(id: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => service.syncOwnedChannels(id).then((r) => r.data),
        onSuccess: (data) => {
            queryClient.setQueryData(tgAccountKeys.ownedChannels(id), data);
            queryClient.invalidateQueries({ queryKey: tgAccountKeys.detail(id) });
        },
    });
}
