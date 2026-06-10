"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inviteKeys } from "@/lib/tanstack/keys";
import InviteService from "@/services/invite/invite.service";
import { $apiAdminClient } from "@/utils/api/admin/fetch.admin.client";
import { errorHandler } from "@/helpers/error/error.handler.helper";
import { isApiErrorResponse } from "@/helpers/error/error.type.helper";
import { ApiErrorResponse } from "@myorg/shared/dto";
import { snackbarSuccess } from "@/utils/snackbar/snackbar.success";
import { useTranslations } from "next-intl";
import { AddInviteChannelOutput, SetInviteTargetChannelOutput } from "@myorg/shared/form";
import { useRouter } from "@/i18n/navigation";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";

const service = new InviteService($apiAdminClient);

function useInviteCache(accountId: string) {
    const queryClient = useQueryClient();

    function invalidateInvite() {
        queryClient.invalidateQueries({ queryKey: inviteKeys.all(accountId) });
    }

    return { invalidateInvite };
}

export function useSetInviteTargetChannel(accountId: string) {
    const { invalidateInvite } = useInviteCache(accountId);
    const t = useTranslations();

    return useMutation({
        mutationFn: (body: SetInviteTargetChannelOutput) =>
            service.setTargetChannel(accountId, body),
        onSuccess: () => {
            invalidateInvite();
            snackbarSuccess(t("pages.admin.tgAccounts.invite.feedback.targetChannelSet"));
        },
        onError: (error) => errorHandler({ error, t }),
    });
}

export function useAddInviteChannel(accountId: string) {
    const { invalidateInvite } = useInviteCache(accountId);
    const t = useTranslations();

    return useMutation({
        mutationFn: (body: AddInviteChannelOutput) =>
            service.addChannel(accountId, body),
        onSuccess: () => {
            invalidateInvite();
            snackbarSuccess(t("pages.admin.tgAccounts.invite.feedback.channelAdded"));
        },
        onError: (error) => errorHandler({ error, t }),
    });
}

export function useRemoveInviteChannel(accountId: string) {
    const { invalidateInvite } = useInviteCache(accountId);
    const t = useTranslations();

    return useMutation({
        mutationFn: (channelId: string) =>
            service.removeChannel(accountId, channelId),
        onSuccess: () => {
            invalidateInvite();
            snackbarSuccess(t("pages.admin.tgAccounts.invite.feedback.channelRemoved"));
        },
        onError: (error) => errorHandler({ error, t }),
    });
}

export function useFetchInviteChannelRecipients(accountId: string) {
    const { invalidateInvite } = useInviteCache(accountId);
    const t = useTranslations();

    return useMutation({
        mutationFn: (channelId: string) =>
            service.fetchRecipients(accountId, channelId),
        onSuccess: () => invalidateInvite(),
        onError: (error) => errorHandler({ error, t }),
    });
}

export function useStartInvite(accountId: string) {
    const { invalidateInvite } = useInviteCache(accountId);
    const t = useTranslations();
    const router = useRouter();

    return useMutation({
        mutationFn: () => service.start(accountId),
        onSuccess: (response) => {
            const invite = response.data;
            invalidateInvite();
            snackbarSuccess(t("pages.admin.tgAccounts.invite.feedback.started"));
            if (invite.currentRunId) {
                router.push(
                    `${FULL_PATH_ROUTE.admin.tgAccounts.path}/${accountId}/invite/${invite.currentRunId}`,
                );
            }
        },
        onError: (error) => errorHandler({ error, t }),
    });
}

export function useStopInvite(accountId: string) {
    const { invalidateInvite } = useInviteCache(accountId);
    const t = useTranslations();

    return useMutation({
        mutationFn: () => service.stop(accountId),
        onSuccess: () => {
            invalidateInvite();
            snackbarSuccess(t("pages.admin.tgAccounts.invite.feedback.stopped"));
        },
        onError: (error) => {
            if (isApiErrorResponse(error) && (error as unknown as ApiErrorResponse).message === "invite.notRunning") {
                invalidateInvite();
                return;
            }
            errorHandler({ error, t });
        },
    });
}

export function useResetInvite(accountId: string) {
    const { invalidateInvite } = useInviteCache(accountId);
    const t = useTranslations();

    return useMutation({
        mutationFn: () => service.reset(accountId),
        onSuccess: () => invalidateInvite(),
        onError: (error) => errorHandler({ error, t }),
    });
}

export function useDeleteInviteRun(accountId: string) {
    const { invalidateInvite } = useInviteCache(accountId);
    const t = useTranslations();

    return useMutation({
        mutationFn: (runId: string) => service.deleteRun(accountId, runId),
        onSuccess: () => invalidateInvite(),
        onError: (error) => errorHandler({ error, t }),
    });
}

export function useDeleteAllInviteRuns(accountId: string) {
    const { invalidateInvite } = useInviteCache(accountId);
    const t = useTranslations();

    return useMutation({
        mutationFn: () => service.deleteAllRuns(accountId),
        onSuccess: () => invalidateInvite(),
        onError: (error) => errorHandler({ error, t }),
    });
}
