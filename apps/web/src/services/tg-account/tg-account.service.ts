import {
    TgAccountDto,
    TgAccountStartResponseDto,
    TgAccountVerifyResponseDto,
    PagedResult,
} from "@myorg/shared/dto";
import { ENDPOINT, FULL_PATH_ENDPOINT } from "@myorg/shared/endpoints";
import { FetchCustom, FetchCustomReturn } from "@/utils/api";
import { TgAccountStartOutput, TgAccountVerifyOutput } from "@myorg/shared/form";
import { toSearchParams } from "@/utils/toSearchParams";
import { TgAccountParams } from "@/lib/tanstack/listDefaults";

const { path } = FULL_PATH_ENDPOINT.tgAccount;
const { auth } = ENDPOINT.tgAccount;

export default class TgAccountService {
    authStart: (body: TgAccountStartOutput) => FetchCustomReturn<TgAccountStartResponseDto>;
    authVerify: (body: TgAccountVerifyOutput) => FetchCustomReturn<TgAccountVerifyResponseDto>;
    getAll: (params: TgAccountParams) => FetchCustomReturn<PagedResult<TgAccountDto>>;
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

        this.getAll = (params) => {
            const query = toSearchParams(params);
            return api<PagedResult<TgAccountDto>>(`${path}?${query.toString()}`, {
                method: "GET",
            });
        };

        this.delete = (id) => api<void>(`${path}/${id}`, { method: "DELETE" });
    }
}
