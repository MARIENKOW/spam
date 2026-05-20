import { FetchCustom, FetchCustomReturn } from "@/utils/api";
import { AdminDto, SessionAdminViewDto } from "@myorg/shared/dto";
import { FULL_PATH_ENDPOINT } from "@myorg/shared/endpoints";

const { path } = FULL_PATH_ENDPOINT.auth.admin.session;

export default class SessionServiceAdmin {
    getMe: () => FetchCustomReturn<SessionAdminViewDto[]>;
    revoke: (sessionId: string) => FetchCustomReturn<void>;
    abortController: AbortController | null = null;
    constructor(api: FetchCustom) {
        this.getMe = async () => {
            if (this.abortController) this.abortController.abort();
            const controller = new AbortController();
            this.abortController = controller;
            const res = await api<SessionAdminViewDto[]>(path, {
                signal: controller.signal,
            });
            return res;
        };
        this.revoke = async (sessionId) => {
            if (this.abortController) this.abortController.abort();
            const controller = new AbortController();
            this.abortController = controller;
            const res = await api<void>(path + "/" + sessionId, {
                signal: controller.signal,
                method: "DELETE",
            });
            return res;
        };
    }
}
