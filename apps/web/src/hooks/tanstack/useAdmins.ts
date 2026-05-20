"use client";

import { useQuery } from "@tanstack/react-query";
import { adminKeys } from "@/lib/tanstack/keys";
import { AdminParams, defaultAdminParams } from "@/lib/tanstack/listDefaults";
import AdminManagementService from "@/services/admin/management/adminManagement.service";
import { $apiAdminClient } from "@/utils/api/admin/fetch.admin.client";

export { defaultAdminParams };

const service = new AdminManagementService($apiAdminClient);

export function useAdmins(params: AdminParams) {
    return useQuery({
        queryKey: adminKeys.list(params),
        queryFn: () => service.getAll(params).then((r) => r.data),
        placeholderData: (prev) => prev,
    });
}
