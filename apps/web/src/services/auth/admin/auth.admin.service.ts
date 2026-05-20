import { FetchCustom, FetchCustomReturn } from "@/utils/api";
import { FULL_PATH_ENDPOINT } from "@myorg/shared/endpoints";
import {
    LoginAdminDtoOutput,
    ForgotPasswordAdminDtoOutput,
    ChangePasswordAdminDtoOutput,
} from "@myorg/shared/form";

const { login, logout, forgotPassword, refresh, google } =
    FULL_PATH_ENDPOINT.auth.admin;

let refreshPromise: FetchCustomReturn<true> | null = null;

export default class AuthAdminService {
    login: (body: LoginAdminDtoOutput) => FetchCustomReturn<true>;
    google: (body: { code: string }) => FetchCustomReturn<true>;
    logout: () => FetchCustomReturn<true>;
    refresh: () => FetchCustomReturn<true>;
    forgotPassword: (
        body: ForgotPasswordAdminDtoOutput,
    ) => FetchCustomReturn<string>;
    changePassword: (
        body: ChangePasswordAdminDtoOutput,
        { token }: { token: string },
    ) => FetchCustomReturn<true>;

    abortController: AbortController | null = null;

    constructor(api: FetchCustom) {
        this.login = async (body) => {
            if (this.abortController) this.abortController.abort();
            const controller = new AbortController();
            this.abortController = controller;
            const res = await api<true>(login.path, {
                signal: controller.signal,
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });
            return res;
        };
        this.google = async (body) => {
            if (this.abortController) this.abortController.abort();
            const controller = new AbortController();
            this.abortController = controller;
            const res = await api<true>(google.path, {
                signal: controller.signal,
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });
            return res;
        };
        this.refresh = async () => {
            // Уже идёт рефреш — возвращаем тот же промис, не делаем новый запрос
            if (refreshPromise) return refreshPromise;

            refreshPromise = api<true>(refresh.path, {
                credentials: "include",
                method: "GET",
            }).finally(() => {
                refreshPromise = null;
            });

            return refreshPromise;
        };

        this.logout = async () => {
            if (this.abortController) this.abortController.abort();
            const controller = new AbortController();
            this.abortController = controller;
            const res = await api<true>(logout.path, {
                signal: controller.signal,
                headers: {
                    "Content-Type": "application/json",
                },
                method: "POST",
            });
            return res;
        };

        this.forgotPassword = async (body) => {
            if (this.abortController) this.abortController.abort();
            const controller = new AbortController();
            this.abortController = controller;
            const res = await api<string>(forgotPassword.path, {
                signal: controller.signal,
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            return res;
        };
        this.changePassword = async (body, { token }) => {
            if (this.abortController) this.abortController.abort();
            const controller = new AbortController();
            this.abortController = controller;
            const res = await api<true>(forgotPassword.path + "/" + token, {
                signal: controller.signal,
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            return res;
        };
    }
}
