"use client";

import { invitationKeys } from "@/lib/tanstack/keys";
import AdminInvitationService from "@/services/admin/invitation/adminInvitation.service";
import { $apiAdminClient } from "@/utils/api/admin/fetch.admin.client";
import { errorHandler } from "@/helpers/error/error.handler.helper";
import { snackbarSuccess } from "@/utils/snackbar/snackbar.success";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { AdminInvitationDto, PagedResult } from "@myorg/shared/dto";

const service = new AdminInvitationService($apiAdminClient);

type InvitationList = PagedResult<AdminInvitationDto> | undefined;

export function useInvitationListCache() {
    const queryClient = useQueryClient();

    function cancel() {
        return queryClient.cancelQueries({ queryKey: invitationKeys.lists() });
    }

    function sync() {
        queryClient.invalidateQueries({ queryKey: invitationKeys.lists() });
    }

    function update(updater: (inv: AdminInvitationDto) => AdminInvitationDto, id: string) {
        queryClient.setQueriesData<InvitationList>(
            { queryKey: invitationKeys.lists() },
            (old) => {
                if (!old) return old;
                return {
                    ...old,
                    data: old.data.map((inv) => inv.id === id ? updater(inv) : inv),
                };
            },
        );
    }

    function remove(id: string) {
        queryClient.setQueriesData<InvitationList>(
            { queryKey: invitationKeys.lists() },
            (old) => {
                if (!old) return old;
                return {
                    ...old,
                    data: old.data.filter((inv) => inv.id !== id),
                    meta: { ...old.meta, total: old.meta.total - 1 },
                };
            },
        );
    }

    return { cancel, sync, update, remove };
}

export function useRevokeInvitation() {
    const t = useTranslations();
    const { cancel, update, sync } = useInvitationListCache();

    return useMutation({
        mutationFn: (invId: string) => service.revoke(invId).then((r) => r.data),
        onMutate: () => cancel(),
        onSuccess: (updated) => {
            update(() => updated, updated.id);
            snackbarSuccess(t("pages.admin.invitation.feedback.revoked"));
        },
        onError: (error) => errorHandler({ error, t }),
        onSettled: () => sync(),
    });
}

export function useUnrevokeInvitation() {
    const t = useTranslations();
    const { cancel, update, sync } = useInvitationListCache();

    return useMutation({
        mutationFn: (invId: string) => service.unrevoke(invId).then((r) => r.data),
        onMutate: () => cancel(),
        onSuccess: (updated) => {
            update(() => updated, updated.id);
            snackbarSuccess(t("pages.admin.invitation.feedback.unrevoked"));
        },
        onError: (error) => errorHandler({ error, t }),
        onSettled: () => sync(),
    });
}

export function useResendInvitation() {
    const t = useTranslations();
    const { cancel, update, sync } = useInvitationListCache();

    return useMutation({
        mutationFn: (invId: string) => service.resend(invId).then((r) => r.data),
        onMutate: () => cancel(),
        onSuccess: (updated) => {
            update(() => updated, updated.id);
            snackbarSuccess(
                t("pages.admin.invitation.feedback.resent", { email: updated.email }),
            );
        },
        onError: (error) => errorHandler({ error, t }),
        onSettled: () => sync(),
    });
}

export function useDeleteInvitation() {
    const t = useTranslations();
    const { cancel, remove, sync } = useInvitationListCache();

    return useMutation({
        mutationFn: (invId: string) => service.delete(invId),
        onMutate: () => cancel(),
        onSuccess: (_, invId) => {
            remove(invId);
            snackbarSuccess(t("pages.admin.invitation.feedback.deleted"));
        },
        onError: (error) => errorHandler({ error, t }),
        onSettled: () => sync(),
    });
}
