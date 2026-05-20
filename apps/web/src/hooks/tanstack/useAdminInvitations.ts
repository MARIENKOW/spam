import { useQuery } from "@tanstack/react-query";
import { invitationKeys } from "@/lib/tanstack/keys";
import {
    InvitationParams,
    defaultInvitationParams,
} from "@/lib/tanstack/listDefaults";
import AdminInvitationService from "@/services/admin/invitation/adminInvitation.service";
import { $apiAdminClient } from "@/utils/api/admin/fetch.admin.client";

export { defaultInvitationParams };

const { getAll } = new AdminInvitationService($apiAdminClient);

export function useAdminInvitations(params: InvitationParams) {
    return useQuery({
        queryKey: invitationKeys.list(params),
        queryFn: () => getAll(params).then((r) => r.data),
        placeholderData: (prev) => prev,
    });
}
