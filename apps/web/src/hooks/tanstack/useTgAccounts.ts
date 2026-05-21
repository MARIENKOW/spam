import { useQuery } from "@tanstack/react-query";
import { tgAccountKeys } from "@/lib/tanstack/keys";
import { TgAccountParams, defaultTgAccountParams } from "@/lib/tanstack/listDefaults";
import TgAccountService from "@/services/tg-account/tg-account.service";
import { $apiAdminClient } from "@/utils/api/admin/fetch.admin.client";

export { defaultTgAccountParams };

const { getAll } = new TgAccountService($apiAdminClient);

export function useTgAccounts(params: TgAccountParams) {
    return useQuery({
        queryKey: tgAccountKeys.list(params),
        queryFn: () => getAll(params).then((r) => r.data),
        placeholderData: (prev) => prev,
    });
}
