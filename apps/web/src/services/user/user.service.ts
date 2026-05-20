import { FetchCustom, FetchCustomReturn } from "@/utils/api";
import { AvailableMode } from "@/theme/theme";
import { ImageDto, UserDto } from "@myorg/shared/dto";
import { FULL_PATH_ENDPOINT } from "@myorg/shared/endpoints";
import { AvailableLanguage } from "@myorg/shared/i18n";
import { AvatarUserInput } from "@myorg/shared/form";

const { me, theme, locale, avatar } = FULL_PATH_ENDPOINT.user;

export default class UserService {
    me: () => FetchCustomReturn<UserDto>;
    changeTheme: ({
        theme,
    }: {
        theme: AvailableMode;
    }) => FetchCustomReturn<true>;
    changeLocale: ({
        locale,
    }: {
        locale: AvailableLanguage;
    }) => FetchCustomReturn<true>;
    changeAvatar: (body: AvatarUserInput) => FetchCustomReturn<ImageDto>;
    deleteAvatar: () => FetchCustomReturn<void>;
    abortController: AbortController | null = null;
    constructor(api: FetchCustom) {
        this.me = async () => {
            if (this.abortController) this.abortController.abort();
            const controller = new AbortController();
            this.abortController = controller;
            const res = await api<UserDto>(me.path, {
                signal: controller.signal,
                cache: "no-store",
            });
            return res;
        };
        this.changeTheme = async (body) => {
            if (this.abortController) this.abortController.abort();
            const controller = new AbortController();
            this.abortController = controller;
            const res = await api<true>(theme.path, {
                signal: controller.signal,
                method: "PUT",
                body: JSON.stringify(body),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            return res;
        };
        this.changeLocale = async (body) => {
            if (this.abortController) this.abortController.abort();
            const controller = new AbortController();
            this.abortController = controller;
            const res = await api<true>(locale.path, {
                signal: controller.signal,
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });
            return res;
        };
        this.changeAvatar = async (body) => {
            const formData = new FormData();
            for (const [key, value] of Object.entries(body)) {
                formData.append(key, value);
            }
            if (this.abortController) this.abortController.abort();
            const controller = new AbortController();
            this.abortController = controller;
            const res = await api<ImageDto>(avatar.path, {
                signal: controller.signal,
                method: "POST",
                body: formData,
            });
            return res;
        };
        this.deleteAvatar = async () => {
            if (this.abortController) this.abortController.abort();
            const controller = new AbortController();
            this.abortController = controller;
            const res = await api<void>(avatar.path, {
                signal: controller.signal,
                method: "DELETE",
            });
            return res;
        };
    }
}
