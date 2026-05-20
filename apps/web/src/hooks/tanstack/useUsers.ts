"use client";

import { useQuery } from "@tanstack/react-query";
import { userKeys } from "@/lib/tanstack/keys";
import { UserParams, defaultUserParams } from "@/lib/tanstack/listDefaults";
import UserManagementService from "@/services/admin/userManagement/userManagement.service";
import { $apiAdminClient } from "@/utils/api/admin/fetch.admin.client";

export { defaultUserParams };

const service = new UserManagementService($apiAdminClient);

export function useUsers(params: UserParams) {
    return useQuery({
        queryKey: userKeys.list(params),
        queryFn: () => service.getAll(params).then((r) => r.data),
        placeholderData: (prev) => prev,
    });
}
