import { MessengerAccountDialogsDto, MessengerMessageDto } from "@myorg/shared/dto";
import { FULL_PATH_ENDPOINT } from "@myorg/shared/endpoints";
import { FetchCustom, FetchCustomReturn } from "@/utils/api";

const { path } = FULL_PATH_ENDPOINT.tgMessenger;

export default class MessengerService {
    getDialogs: () => FetchCustomReturn<MessengerAccountDialogsDto[]>;
    getMessages: (params: {
        accountId: string;
        dialogId: string;
        limit?: number;
        offsetId?: number;
    }) => FetchCustomReturn<MessengerMessageDto[]>;
    sendMessage: (body: { accountId: string; dialogId: string; text: string }) => FetchCustomReturn<void>;

    constructor(api: FetchCustom) {
        this.getDialogs = () => api<MessengerAccountDialogsDto[]>(`${path}/dialogs`, { method: "GET" });

        this.getMessages = ({ accountId, dialogId, limit = 30, offsetId = 0 }) => {
            const q = new URLSearchParams({ accountId, limit: String(limit), offsetId: String(offsetId) });
            return api<MessengerMessageDto[]>(`${path}/dialogs/${dialogId}/messages?${q}`, { method: "GET" });
        };

        this.sendMessage = (body) =>
            api<void>(`${path}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
    }
}
