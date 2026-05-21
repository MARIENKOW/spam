"use client";

import { tgAccountKeys } from "@/lib/tanstack/keys";
import TgAccountService from "@/services/tg-account/tg-account.service";
import { $apiAdminClient } from "@/utils/api/admin/fetch.admin.client";
import { errorHandler } from "@/helpers/error/error.handler.helper";
import { snackbarSuccess } from "@/utils/snackbar/snackbar.success";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

const service = new TgAccountService($apiAdminClient);

export function useTgAccountListCache() {
    const queryClient = useQueryClient();

    function cancel() {
        return queryClient.cancelQueries({ queryKey: tgAccountKeys.lists() });
    }

    function sync() {
        queryClient.invalidateQueries({ queryKey: tgAccountKeys.lists() });
    }

    return { cancel, sync };
}

export function useDeleteTgAccount() {
    const t = useTranslations();
    const { cancel, sync } = useTgAccountListCache();

    return useMutation({
        mutationFn: (id: string) => service.delete(id),
        onMutate: () => cancel(),
        onSuccess: () => {
            snackbarSuccess(t("pages.admin.tgAccounts.feedback.deleted"));
        },
        onError: (error) => errorHandler({ error, t }),
        onSettled: () => sync(),
    });
}
