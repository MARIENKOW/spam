import { FetchCustom, FetchCustomReturn } from "@/utils/api";
import { FULL_PATH_ENDPOINT } from "@myorg/shared/endpoints";
import { AdminInvitationAcceptDto } from "@myorg/shared/dto";
import { RegisterByInvitationAdminDtoOutput } from "@myorg/shared/form";

const { accept } = FULL_PATH_ENDPOINT.admin.invitation;

export default class AdminInvitationAcceptService {
    check: (token: string) => FetchCustomReturn<AdminInvitationAcceptDto>;
    register: (
        token: string,
        data: RegisterByInvitationAdminDtoOutput,
    ) => FetchCustomReturn<void>;

    constructor(api: FetchCustom) {
        this.check = (token) =>
            api<AdminInvitationAcceptDto>(
                `${accept.path}?token=${encodeURIComponent(token)}`,
                { method: "GET" },
            );

        this.register = (token, data) =>
            api<void>(
                `${accept.path}?token=${encodeURIComponent(token)}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                },
            );
    }
}
