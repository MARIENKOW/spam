"use client";

import { userKeys, userSessionKeys } from "@/lib/tanstack/keys";
import UserManagementService from "@/services/admin/userManagement/userManagement.service";
import { $apiAdminClient } from "@/utils/api/admin/fetch.admin.client";
import { errorHandler } from "@/helpers/error/error.handler.helper";
import { snackbarSuccess } from "@/utils/snackbar/snackbar.success";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { UserManagementDto, PagedResult } from "@myorg/shared/dto";
import { UpdateNoteUserManagementDtoOutput } from "@myorg/shared/form";

const service = new UserManagementService($apiAdminClient);

type UserList = PagedResult<UserManagementDto> | undefined;

export function useUserListCache() {
    const queryClient = useQueryClient();

    function cancel() {
        return queryClient.cancelQueries({ queryKey: userKeys.lists() });
    }

    function sync() {
        queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    }

    function update(updater: (u: UserManagementDto) => UserManagementDto, id: string) {
        queryClient.setQueriesData<UserList>({ queryKey: userKeys.lists() }, (old) => {
            if (!old) return old;
            return { ...old, data: old.data.map((u) => (u.id === id ? updater(u) : u)) };
        });
    }

    function remove(id: string) {
        queryClient.setQueriesData<UserList>({ queryKey: userKeys.lists() }, (old) => {
            if (!old) return old;
            return {
                ...old,
                data: old.data.filter((u) => u.id !== id),
                meta: { ...old.meta, total: old.meta.total - 1 },
            };
        });
    }

    return { cancel, sync, update, remove };
}

export function useBlockUser() {
    const t = useTranslations();
    const { cancel, update, sync } = useUserListCache();

    return useMutation({
        mutationFn: (id: string) => service.block(id).then((r) => r.data),
        onMutate: () => cancel(),
        onSuccess: (updated) => {
            update(() => updated, updated.id);
            snackbarSuccess(t("pages.admin.users.feedback.blocked"));
        },
        onError: (error) => errorHandler({ error, t }),
        onSettled: () => sync(),
    });
}

export function useActivateUser() {
    const t = useTranslations();
    const { cancel, update, sync } = useUserListCache();

    return useMutation({
        mutationFn: (id: string) => service.activate(id).then((r) => r.data),
        onMutate: () => cancel(),
        onSuccess: (updated) => {
            update(() => updated, updated.id);
            snackbarSuccess(t("pages.admin.users.feedback.activated"));
        },
        onError: (error) => errorHandler({ error, t }),
        onSettled: () => sync(),
    });
}

export function useDeleteUser() {
    const t = useTranslations();
    const { cancel, remove, sync } = useUserListCache();

    return useMutation({
        mutationFn: (id: string) => service.delete(id),
        onMutate: () => cancel(),
        onSuccess: (_, id) => {
            remove(id);
            snackbarSuccess(t("pages.admin.users.feedback.deleted"));
        },
        onError: (error) => errorHandler({ error, t }),
        onSettled: () => sync(),
    });
}

export function useUpdateUserNote() {
    const t = useTranslations();
    const { cancel, update, sync } = useUserListCache();

    return useMutation({
        mutationFn: ({ id, body }: { id: string; body: UpdateNoteUserManagementDtoOutput }) =>
            service.updateNote(id, body).then((r) => r.data),
        onMutate: () => cancel(),
        onSuccess: (updated) => {
            update(() => updated, updated.id);
            snackbarSuccess(t("pages.admin.users.feedback.noteUpdated"));
        },
        onError: (error) => errorHandler({ error, t }),
        onSettled: () => sync(),
    });
}

export function useUserSessions(userId: string) {
    return useQuery({
        queryKey: userSessionKeys.all(userId),
        queryFn: () => service.getSessions(userId).then((r) => r.data),
    });
}

export function useDeleteUserSession(userId: string) {
    const t = useTranslations();
    const queryClient = useQueryClient();
    const { sync: syncUsers } = useUserListCache();

    function syncSessions() {
        queryClient.invalidateQueries({ queryKey: userSessionKeys.all(userId) });
    }

    return useMutation({
        mutationFn: (sessionId: string) => service.deleteSession(userId, sessionId),
        onSuccess: () => {
            snackbarSuccess(t("pages.admin.users.feedback.sessionDeleted"));
        },
        onError: (error) => errorHandler({ error, t }),
        onSettled: () => { syncSessions(); syncUsers(); },
    });
}

export function useDeleteAllUserSessions(userId: string) {
    const t = useTranslations();
    const queryClient = useQueryClient();
    const { sync: syncUsers } = useUserListCache();

    function syncSessions() {
        queryClient.invalidateQueries({ queryKey: userSessionKeys.all(userId) });
    }

    return useMutation({
        mutationFn: () => service.deleteAllSessions(userId),
        onSuccess: () => {
            snackbarSuccess(t("pages.admin.users.feedback.allSessionsDeleted"));
        },
        onError: (error) => errorHandler({ error, t }),
        onSettled: () => { syncSessions(); syncUsers(); },
    });
}
