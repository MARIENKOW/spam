"use client";

import { adminKeys, adminSessionKeys } from "@/lib/tanstack/keys";
import AdminManagementService from "@/services/admin/management/adminManagement.service";
import { $apiAdminClient } from "@/utils/api/admin/fetch.admin.client";
import { errorHandler } from "@/helpers/error/error.handler.helper";
import { snackbarSuccess } from "@/utils/snackbar/snackbar.success";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { AdminManagementDto, PagedResult } from "@myorg/shared/dto";
import { UpdateNoteAdminManagementDtoOutput } from "@myorg/shared/form";

const service = new AdminManagementService($apiAdminClient);

type AdminList = PagedResult<AdminManagementDto> | undefined;

export function useAdminListCache() {
    const queryClient = useQueryClient();

    function cancel() {
        return queryClient.cancelQueries({ queryKey: adminKeys.lists() });
    }

    function sync() {
        queryClient.invalidateQueries({ queryKey: adminKeys.lists() });
    }

    function update(
        updater: (a: AdminManagementDto) => AdminManagementDto,
        id: string,
    ) {
        queryClient.setQueriesData<AdminList>(
            { queryKey: adminKeys.lists() },
            (old) => {
                if (!old) return old;
                return {
                    ...old,
                    data: old.data.map((a) => (a.id === id ? updater(a) : a)),
                };
            },
        );
    }

    function remove(id: string) {
        queryClient.setQueriesData<AdminList>(
            { queryKey: adminKeys.lists() },
            (old) => {
                if (!old) return old;
                return {
                    ...old,
                    data: old.data.filter((a) => a.id !== id),
                    meta: { ...old.meta, total: old.meta.total - 1 },
                };
            },
        );
    }

    return { cancel, sync, update, remove };
}

export function useBlockAdmin() {
    const t = useTranslations();
    const { cancel, update, sync } = useAdminListCache();

    return useMutation({
        mutationFn: (id: string) => service.block(id).then((r) => r.data),
        onMutate: () => cancel(),
        onSuccess: (updated) => {
            update(() => updated, updated.id);
            snackbarSuccess(t("pages.admin.admins.feedback.blocked"));
        },
        onError: (error) => errorHandler({ error, t }),
        onSettled: () => sync(),
    });
}

export function useUnblockAdmin() {
    const t = useTranslations();
    const { cancel, update, sync } = useAdminListCache();

    return useMutation({
        mutationFn: (id: string) => service.unblock(id).then((r) => r.data),
        onMutate: () => cancel(),
        onSuccess: (updated) => {
            update(() => updated, updated.id);
            snackbarSuccess(t("pages.admin.admins.feedback.unblocked"));
        },
        onError: (error) => errorHandler({ error, t }),
        onSettled: () => sync(),
    });
}

export function useDeleteAdmin() {
    const t = useTranslations();
    const { cancel, remove, sync } = useAdminListCache();

    return useMutation({
        mutationFn: (id: string) => service.delete(id),
        onMutate: () => cancel(),
        onSuccess: (_, id) => {
            remove(id);
            snackbarSuccess(t("pages.admin.admins.feedback.deleted"));
        },
        onError: (error) => errorHandler({ error, t }),
        onSettled: () => sync(),
    });
}

export function useUpdateAdminNote() {
    const t = useTranslations();
    const { cancel, update, sync } = useAdminListCache();

    return useMutation({
        mutationFn: ({
            id,
            body,
        }: {
            id: string;
            body: UpdateNoteAdminManagementDtoOutput;
        }) => service.updateNote(id, body).then((r) => r.data),
        onMutate: () => cancel(),
        onSuccess: (updated) => {
            update(() => updated, updated.id);
            snackbarSuccess(t("pages.admin.admins.feedback.noteUpdated"));
        },
        onError: (error) => errorHandler({ error, t }),
        onSettled: () => sync(),
    });
}

export function useAdminSessions(adminId: string) {
    return useQuery({
        queryKey: adminSessionKeys.all(adminId),
        queryFn: () => service.getSessions(adminId).then((r) => r.data),
    });
}

export function useDeleteAdminSession(adminId: string) {
    const t = useTranslations();
    const queryClient = useQueryClient();
    const { sync: syncAdmins } = useAdminListCache();

    function syncSessions() {
        queryClient.invalidateQueries({
            queryKey: adminSessionKeys.all(adminId),
        });
    }

    return useMutation({
        mutationFn: (sessionId: string) =>
            service.deleteSession(adminId, sessionId),
        onSuccess: () => {
            snackbarSuccess(t("pages.admin.admins.feedback.sessionDeleted"));
        },
        onError: (error) => errorHandler({ error, t }),
        onSettled: () => {
            syncSessions();
            syncAdmins();
        },
    });
}

export function useDeleteAllAdminSessions(adminId: string) {
    const t = useTranslations();
    const queryClient = useQueryClient();
    const { sync: syncAdmins } = useAdminListCache();

    function syncSessions() {
        queryClient.invalidateQueries({
            queryKey: adminSessionKeys.all(adminId),
        });
    }

    return useMutation({
        mutationFn: () => service.deleteAllSessions(adminId),
        onSuccess: () => {
            snackbarSuccess(
                t("pages.admin.admins.feedback.allSessionsDeleted"),
            );
        },
        onError: (error) => errorHandler({ error, t }),
        onSettled: () => {
            syncSessions();
            syncAdmins();
        },
    });
}
