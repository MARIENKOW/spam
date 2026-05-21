import {
    BroadcastDto,
    BroadcastProgressDto,
    BroadcastRecipientDto,
    BroadcastRunDto,
    BroadcastRunRecipientDto,
    ChannelSearchResultDto,
    PagedResult,
} from "@myorg/shared/dto";
import { FULL_PATH_ENDPOINT } from "@myorg/shared/endpoints";
import {
    AddBroadcastChannelOutput,
    SearchChannelOutput,
    UpdateBroadcastMessageOutput,
} from "@myorg/shared/form";
import { FetchCustom, FetchCustomReturn } from "@/utils/api";
import { toSearchParams } from "@/utils/toSearchParams";

const tgPath = FULL_PATH_ENDPOINT.tgAccount.path;

function broadcastPath(accountId: string): string {
    return `${tgPath}/${accountId}/broadcast`;
}

export default class BroadcastService {
    get: (accountId: string) => FetchCustomReturn<BroadcastDto>;
    updateMessage: (accountId: string, body: UpdateBroadcastMessageOutput) => FetchCustomReturn<BroadcastDto>;
    searchChannels: (accountId: string, body: SearchChannelOutput) => FetchCustomReturn<ChannelSearchResultDto[]>;
    addChannel: (accountId: string, body: AddBroadcastChannelOutput) => FetchCustomReturn<BroadcastDto>;
    removeChannel: (accountId: string, channelId: string) => FetchCustomReturn<BroadcastDto>;
    fetchRecipients: (accountId: string, channelId: string) => FetchCustomReturn<{ count: number }>;
    getProgress: (accountId: string) => FetchCustomReturn<BroadcastProgressDto>;
    getRecipients: (
        accountId: string,
        params: { page: number; limit: number; status?: string },
    ) => FetchCustomReturn<PagedResult<BroadcastRecipientDto>>;
    getHistory: (accountId: string) => FetchCustomReturn<BroadcastRunDto[]>;
    getRunRecipients: (
        accountId: string,
        runId: string,
        params: { page: number; limit: number; status?: string },
    ) => FetchCustomReturn<PagedResult<BroadcastRunRecipientDto>>;
    deleteRun: (accountId: string, runId: string) => FetchCustomReturn<void>;
    deleteAllRuns: (accountId: string) => FetchCustomReturn<void>;
    start: (accountId: string) => FetchCustomReturn<BroadcastDto>;
    stop: (accountId: string) => FetchCustomReturn<BroadcastDto>;
    reset: (accountId: string) => FetchCustomReturn<BroadcastDto>;

    constructor(api: FetchCustom) {
        this.get = (accountId) =>
            api<BroadcastDto>(broadcastPath(accountId), { method: "GET" });

        this.updateMessage = (accountId, body) =>
            api<BroadcastDto>(`${broadcastPath(accountId)}/message`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

        this.searchChannels = (accountId, body) =>
            api<ChannelSearchResultDto[]>(`${broadcastPath(accountId)}/channels/search`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

        this.addChannel = (accountId, body) =>
            api<BroadcastDto>(`${broadcastPath(accountId)}/channels`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

        this.removeChannel = (accountId, channelId) =>
            api<BroadcastDto>(`${broadcastPath(accountId)}/channels/${channelId}`, {
                method: "DELETE",
            });

        this.fetchRecipients = (accountId, channelId) =>
            api<{ count: number }>(
                `${broadcastPath(accountId)}/channels/${channelId}/fetch-recipients`,
                { method: "POST" },
            );

        this.getProgress = (accountId) =>
            api<BroadcastProgressDto>(`${broadcastPath(accountId)}/progress`, {
                method: "GET",
            });

        this.getRecipients = (accountId, params) => {
            const query = toSearchParams(params);
            return api<PagedResult<BroadcastRecipientDto>>(
                `${broadcastPath(accountId)}/progress/recipients?${query}`,
                { method: "GET" },
            );
        };

        this.getHistory = (accountId) =>
            api<BroadcastRunDto[]>(`${broadcastPath(accountId)}/history`, {
                method: "GET",
            });

        this.getRunRecipients = (accountId, runId, params) => {
            const query = toSearchParams(params);
            return api<PagedResult<BroadcastRunRecipientDto>>(
                `${broadcastPath(accountId)}/history/${runId}/recipients?${query}`,
                { method: "GET" },
            );
        };

        this.deleteRun = (accountId, runId) =>
            api<void>(`${broadcastPath(accountId)}/history/${runId}`, { method: "DELETE" });

        this.deleteAllRuns = (accountId) =>
            api<void>(`${broadcastPath(accountId)}/history`, { method: "DELETE" });

        this.start = (accountId) =>
            api<BroadcastDto>(`${broadcastPath(accountId)}/start`, { method: "POST" });

        this.stop = (accountId) =>
            api<BroadcastDto>(`${broadcastPath(accountId)}/stop`, { method: "POST" });

        this.reset = (accountId) =>
            api<BroadcastDto>(`${broadcastPath(accountId)}/reset`, { method: "POST" });
    }
}
