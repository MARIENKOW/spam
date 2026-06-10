import {
    TgAccountDto,
    TgAccountStartResponseDto,
    TgAccountVerifyResponseDto,
    TgAccountQrStartResponseDto,
    TgAccountQrPollResponseDto,
    TgAccountQrVerify2faResponseDto,
    TgOwnedChannelDto,
    PagedResult,
} from "@myorg/shared/dto";
import { ENDPOINT, FULL_PATH_ENDPOINT } from "@myorg/shared/endpoints";
import { FetchCustom, FetchCustomReturn } from "@/utils/api";
import { TgAccountStartOutput, TgAccountVerifyOutput } from "@myorg/shared/form";
import { toSearchParams } from "@/utils/toSearchParams";
import { TgAccountParams } from "@/lib/tanstack/listDefaults";

const { path } = FULL_PATH_ENDPOINT.tgAccount;
const { auth } = ENDPOINT.tgAccount;
const QR_BASE = `${path}/${auth.path}/${auth.qr.path}`;

export default class TgAccountService {
    authStart: (body: TgAccountStartOutput) => FetchCustomReturn<TgAccountStartResponseDto>;
    authVerify: (body: TgAccountVerifyOutput) => FetchCustomReturn<TgAccountVerifyResponseDto>;
    qrStart: () => FetchCustomReturn<TgAccountQrStartResponseDto>;
    qrPoll: (sessionId: string) => FetchCustomReturn<TgAccountQrPollResponseDto>;
    qrVerify2fa: (sessionId: string, password: string) => FetchCustomReturn<TgAccountQrVerify2faResponseDto>;
    qrCancel: (sessionId: string) => FetchCustomReturn<void>;
    getAll: (params: TgAccountParams) => FetchCustomReturn<PagedResult<TgAccountDto>>;
    getOne: (id: string) => FetchCustomReturn<TgAccountDto>;
    getOwnedChannels: (id: string) => FetchCustomReturn<TgOwnedChannelDto[]>;
    syncOwnedChannels: (id: string) => FetchCustomReturn<TgOwnedChannelDto[]>;
    delete: (id: string) => FetchCustomReturn<void>;

    constructor(api: FetchCustom) {
        this.authStart = (body) =>
            api<TgAccountStartResponseDto>(`${path}/${auth.path}/${auth.start.path}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

        this.authVerify = (body) =>
            api<TgAccountVerifyResponseDto>(`${path}/${auth.path}/${auth.verify.path}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

        this.qrStart = () =>
            api<TgAccountQrStartResponseDto>(`${QR_BASE}/${auth.qr.start.path}`, {
                method: "POST",
            });

        this.qrPoll = (sessionId) =>
            api<TgAccountQrPollResponseDto>(`${QR_BASE}/${sessionId}`, {
                method: "GET",
            });

        this.qrVerify2fa = (sessionId, password) =>
            api<TgAccountQrVerify2faResponseDto>(`${QR_BASE}/${sessionId}/verify2fa`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

        this.qrCancel = (sessionId) =>
            api<void>(`${QR_BASE}/${sessionId}`, { method: "DELETE" });

        this.getAll = (params) => {
            const query = toSearchParams(params);
            return api<PagedResult<TgAccountDto>>(`${path}?${query.toString()}`, {
                method: "GET",
            });
        };

        this.getOne = (id) =>
            api<TgAccountDto>(`${path}/${id}`, { method: "GET" });

        this.getOwnedChannels = (id) =>
            api<TgOwnedChannelDto[]>(`${path}/${id}/owned-channels`, { method: "GET" });

        this.syncOwnedChannels = (id) =>
            api<TgOwnedChannelDto[]>(`${path}/${id}/owned-channels/sync`, { method: "POST" });

        this.delete = (id) => api<void>(`${path}/${id}`, { method: "DELETE" });
    }
}
