import {
    ChannelSearchResultDto,
    InviteDto,
    InviteProgressDto,
    InviteRecipientDto,
    InviteRunDto,
    InviteRunRecipientDto,
    PagedResult,
} from "@myorg/shared/dto";
import { FULL_PATH_ENDPOINT } from "@myorg/shared/endpoints";
import {
    AddInviteChannelOutput,
    SearchChannelOutput,
    SetInviteTargetChannelOutput,
} from "@myorg/shared/form";
import { FetchCustom, FetchCustomReturn } from "@/utils/api";
import { toSearchParams } from "@/utils/toSearchParams";

const tgPath = FULL_PATH_ENDPOINT.tgAccount.path;

function invitePath(accountId: string): string {
    return `${tgPath}/${accountId}/invite`;
}

export default class InviteService {
    get: (accountId: string) => FetchCustomReturn<InviteDto>;
    setTargetChannel: (accountId: string, body: SetInviteTargetChannelOutput) => FetchCustomReturn<InviteDto>;
    searchChannels: (accountId: string, body: SearchChannelOutput) => FetchCustomReturn<ChannelSearchResultDto[]>;
    addChannel: (accountId: string, body: AddInviteChannelOutput) => FetchCustomReturn<InviteDto>;
    removeChannel: (accountId: string, channelId: string) => FetchCustomReturn<InviteDto>;
    fetchRecipients: (accountId: string, channelId: string) => FetchCustomReturn<{ count: number }>;
    getProgress: (accountId: string) => FetchCustomReturn<InviteProgressDto>;
    getRecipients: (
        accountId: string,
        params: { page: number; limit: number; status?: string },
    ) => FetchCustomReturn<PagedResult<InviteRecipientDto>>;
    getHistory: (accountId: string) => FetchCustomReturn<InviteRunDto[]>;
    getRun: (accountId: string, runId: string) => FetchCustomReturn<InviteRunDto>;
    getRunRecipients: (
        accountId: string,
        runId: string,
        params: { page: number; limit: number; status?: string },
    ) => FetchCustomReturn<PagedResult<InviteRunRecipientDto>>;
    deleteRun: (accountId: string, runId: string) => FetchCustomReturn<void>;
    deleteAllRuns: (accountId: string) => FetchCustomReturn<void>;
    start: (accountId: string) => FetchCustomReturn<InviteDto>;
    stop: (accountId: string) => FetchCustomReturn<InviteDto>;
    reset: (accountId: string) => FetchCustomReturn<InviteDto>;

    constructor(api: FetchCustom) {
        this.get = (accountId) =>
            api<InviteDto>(invitePath(accountId), { method: "GET" });

        this.setTargetChannel = (accountId, body) =>
            api<InviteDto>(`${invitePath(accountId)}/target-channel`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

        this.searchChannels = (accountId, body) =>
            api<ChannelSearchResultDto[]>(`${invitePath(accountId)}/channels/search`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

        this.addChannel = (accountId, body) =>
            api<InviteDto>(`${invitePath(accountId)}/channels`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

        this.removeChannel = (accountId, channelId) =>
            api<InviteDto>(`${invitePath(accountId)}/channels/${channelId}`, {
                method: "DELETE",
            });

        this.fetchRecipients = (accountId, channelId) =>
            api<{ count: number }>(
                `${invitePath(accountId)}/channels/${channelId}/fetch-recipients`,
                { method: "POST" },
            );

        this.getProgress = (accountId) =>
            api<InviteProgressDto>(`${invitePath(accountId)}/progress`, { method: "GET" });

        this.getRecipients = (accountId, params) => {
            const query = toSearchParams(params);
            return api<PagedResult<InviteRecipientDto>>(
                `${invitePath(accountId)}/progress/recipients?${query}`,
                { method: "GET" },
            );
        };

        this.getHistory = (accountId) =>
            api<InviteRunDto[]>(`${invitePath(accountId)}/history`, { method: "GET" });

        this.getRun = (accountId, runId) =>
            api<InviteRunDto>(`${invitePath(accountId)}/history/${runId}`, { method: "GET" });

        this.getRunRecipients = (accountId, runId, params) => {
            const query = toSearchParams(params);
            return api<PagedResult<InviteRunRecipientDto>>(
                `${invitePath(accountId)}/history/${runId}/recipients?${query}`,
                { method: "GET" },
            );
        };

        this.deleteRun = (accountId, runId) =>
            api<void>(`${invitePath(accountId)}/history/${runId}`, { method: "DELETE" });

        this.deleteAllRuns = (accountId) =>
            api<void>(`${invitePath(accountId)}/history`, { method: "DELETE" });

        this.start = (accountId) =>
            api<InviteDto>(`${invitePath(accountId)}/start`, { method: "POST" });

        this.stop = (accountId) =>
            api<InviteDto>(`${invitePath(accountId)}/stop`, { method: "POST" });

        this.reset = (accountId) =>
            api<InviteDto>(`${invitePath(accountId)}/reset`, { method: "POST" });
    }
}
