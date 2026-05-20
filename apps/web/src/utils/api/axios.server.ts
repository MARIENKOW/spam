import { AxiosInstance } from "axios";
import { getAllCookieToClient } from "@/actions/cookies.actions";
import { API_SERVER_BASE_URL } from "@/utils/api/urls.server";

export const axiosServerConfig = {
    baseURL: API_SERVER_BASE_URL,
};

export const applyCookieInterceptor = (instance: AxiosInstance) => {
    instance.interceptors.request.use(async (config) => {
        const cookie = await getAllCookieToClient();
        config.headers.set("cookie", cookie);
        return config;
    });
};
