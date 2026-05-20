import { FetchCustom, FetchCustomReturn } from "@/utils/api";
import { ChangePasswordStatus, MailSendSuccess } from "@myorg/shared/dto";
import { FULL_PATH_ENDPOINT } from "@myorg/shared/endpoints";
import {
    ChangePasswordCodeAdminDtoOutput,
    ChangePasswordAdminDtoOutput,
    ChangePasswordSettingsAdminDtoOutput,
} from "@myorg/shared/form";

const { status, confirm, resend, init, initWithoutPassword, cancel } =
    FULL_PATH_ENDPOINT.admin.changePassword;

export default class ChangePasswordAdminService {
    init: (
        body: ChangePasswordSettingsAdminDtoOutput,
    ) => FetchCustomReturn<MailSendSuccess>;
    initWithoutPassword: (
        body: ChangePasswordAdminDtoOutput,
    ) => FetchCustomReturn<MailSendSuccess>;
    cancel: () => FetchCustomReturn<void>;
    resend: () => FetchCustomReturn<MailSendSuccess>;
    confirm: (
        body: ChangePasswordCodeAdminDtoOutput,
    ) => FetchCustomReturn<void>;
    status: () => FetchCustomReturn<ChangePasswordStatus>;
    abortController: AbortController | null = null;
    constructor(api: FetchCustom) {
        this.init = async (body) => {
            if (this.abortController) this.abortController.abort();
            const controller = new AbortController();
            this.abortController = controller;
            const res = await api<MailSendSuccess>(init.path, {
                signal: controller.signal,
                headers: {
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify(body),
            });
            return res;
        };
        this.initWithoutPassword = async (body) => {
            if (this.abortController) this.abortController.abort();
            const controller = new AbortController();
            this.abortController = controller;
            const res = await api<MailSendSuccess>(initWithoutPassword.path, {
                signal: controller.signal,
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });
            return res;
        };
        this.confirm = async (body) => {
            if (this.abortController) this.abortController.abort();
            const controller = new AbortController();
            this.abortController = controller;
            const res = await api<void>(confirm.path, {
                signal: controller.signal,
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });
            return res;
        };
        this.resend = async () => {
            if (this.abortController) this.abortController.abort();
            const controller = new AbortController();
            this.abortController = controller;
            const res = await api<MailSendSuccess>(resend.path, {
                signal: controller.signal,
                headers: {
                    "Content-Type": "application/json",
                },
                method: "POST",
            });
            return res;
        };
        this.status = async () => {
            if (this.abortController) this.abortController.abort();
            const controller = new AbortController();
            this.abortController = controller;
            const res = await api<ChangePasswordStatus>(status.path, {
                signal: controller.signal,
            });
            return res;
        };
        this.cancel = async () => {
            if (this.abortController) this.abortController.abort();
            const controller = new AbortController();
            this.abortController = controller;
            const res = await api<void>(cancel.path, {
                signal: controller.signal,
                method: "DELETE",
            });
            return res;
        };
    }
}
