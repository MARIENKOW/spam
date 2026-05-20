import { FetchCustom, FetchCustomReturn } from "@/utils/api";
import { SessionUserViewDto } from "@myorg/shared/dto";
import { FULL_PATH_ENDPOINT } from "@myorg/shared/endpoints";

const { path } = FULL_PATH_ENDPOINT.auth.user.session;

export default class SessionServiceUser {
    getMe: () => FetchCustomReturn<SessionUserViewDto[]>;
    revoke: (sessionId: string) => FetchCustomReturn<void>;
    abortController: AbortController | null = null;
    constructor(api: FetchCustom) {
        this.getMe = async () => {
            if (this.abortController) this.abortController.abort();
            const controller = new AbortController();
            this.abortController = controller;
            const res = await api<SessionUserViewDto[]>(path, {
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
