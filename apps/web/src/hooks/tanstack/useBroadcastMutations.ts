"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { broadcastKeys, tgAccountKeys } from "@/lib/tanstack/keys";
import BroadcastService from "@/services/broadcast/broadcast.service";
import { $apiAdminClient } from "@/utils/api/admin/fetch.admin.client";
import { errorHandler } from "@/helpers/error/error.handler.helper";
import { snackbarSuccess } from "@/utils/snackbar/snackbar.success";
import { useTranslations } from "next-intl";
import { AddBroadcastChannelOutput } from "@myorg/shared/form";

const service = new BroadcastService($apiAdminClient);

function useBroadcastCache(accountId: string) {
    const queryClient = useQueryClient();

    function invalidateBroadcast() {
        queryClient.invalidateQueries({ queryKey: broadcastKeys.all(accountId) });
    }

    function invalidateTgAccounts() {
        queryClient.invalidateQueries({ queryKey: tgAccountKeys.lists() });
    }

    return { invalidateBroadcast, invalidateTgAccounts };
}

export function useUpdateBroadcastMessage(accountId: string) {
    const { invalidateBroadcast } = useBroadcastCache(accountId);
    const t = useTranslations();

    return useMutation({
        mutationFn: (message: string) =>
            service.updateMessage(accountId, { message }),
        onSuccess: () => invalidateBroadcast(),
        onError: (error) => errorHandler({ error, t }),
    });
}

export function useAddBroadcastChannel(accountId: string) {
    const { invalidateBroadcast } = useBroadcastCache(accountId);
    const t = useTranslations();

    return useMutation({
        mutationFn: (body: AddBroadcastChannelOutput) =>
            service.addChannel(accountId, body),
        onSuccess: () => {
            invalidateBroadcast();
            snackbarSuccess(t("pages.admin.tgAccounts.broadcast.feedback.channelAdded"));
        },
        onError: (error) => errorHandler({ error, t }),
    });
}

export function useRemoveBroadcastChannel(accountId: string) {
    const { invalidateBroadcast } = useBroadcastCache(accountId);
    const t = useTranslations();

    return useMutation({
        mutationFn: (channelId: string) =>
            service.removeChannel(accountId, channelId),
        onSuccess: () => {
            invalidateBroadcast();
            snackbarSuccess(t("pages.admin.tgAccounts.broadcast.feedback.channelRemoved"));
        },
        onError: (error) => errorHandler({ error, t }),
    });
}

export function useFetchChannelRecipients(accountId: string) {
    const { invalidateBroadcast } = useBroadcastCache(accountId);
    const t = useTranslations();

    return useMutation({
        mutationFn: (channelId: string) =>
            service.fetchRecipients(accountId, channelId),
        onSuccess: () => invalidateBroadcast(),
        onError: (error) => errorHandler({ error, t }),
    });
}

export function useStartBroadcast(accountId: string) {
    const { invalidateBroadcast, invalidateTgAccounts } = useBroadcastCache(accountId);
    const t = useTranslations();

    return useMutation({
        mutationFn: () => service.start(accountId),
        onSuccess: () => {
            invalidateBroadcast();
            invalidateTgAccounts();
            snackbarSuccess(t("pages.admin.tgAccounts.broadcast.feedback.started"));
        },
        onError: (error) => errorHandler({ error, t }),
    });
}

export function useStopBroadcast(accountId: string) {
    const { invalidateBroadcast, invalidateTgAccounts } = useBroadcastCache(accountId);
    const t = useTranslations();

    return useMutation({
        mutationFn: () => service.stop(accountId),
        onSuccess: () => {
            invalidateBroadcast();
            invalidateTgAccounts();
            snackbarSuccess(t("pages.admin.tgAccounts.broadcast.feedback.stopped"));
        },
        onError: (error) => errorHandler({ error, t }),
    });
}

export function useResetBroadcast(accountId: string) {
    const { invalidateBroadcast } = useBroadcastCache(accountId);
    const t = useTranslations();

    return useMutation({
        mutationFn: () => service.reset(accountId),
        onSuccess: () => invalidateBroadcast(),
        onError: (error) => errorHandler({ error, t }),
    });
}

export function useDeleteBroadcastRun(accountId: string) {
    const { invalidateBroadcast } = useBroadcastCache(accountId);
    const t = useTranslations();

    return useMutation({
        mutationFn: (runId: string) => service.deleteRun(accountId, runId),
        onSuccess: () => invalidateBroadcast(),
        onError: (error) => errorHandler({ error, t }),
    });
}

export function useDeleteAllBroadcastRuns(accountId: string) {
    const { invalidateBroadcast } = useBroadcastCache(accountId);
    const t = useTranslations();

    return useMutation({
        mutationFn: () => service.deleteAllRuns(accountId),
        onSuccess: () => invalidateBroadcast(),
        onError: (error) => errorHandler({ error, t }),
    });
}
