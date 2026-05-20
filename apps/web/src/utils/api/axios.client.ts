import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from "axios";
import { dispatchCustomEvent, EVENTS_KEYS } from "@/helpers/event.helper";
import { API_CLIENT_BASE_URL } from "@/utils/api/urls.client";

export const axiosClientConfig = {
    baseURL: API_CLIENT_BASE_URL,
    withCredentials: true,
};

const isUnauthorized = (error: unknown): boolean =>
    axios.isAxiosError(error) && (error as AxiosError).response?.status === 401;

export const apply401Interceptor = (
    instance: AxiosInstance,
    refresh: () => Promise<unknown>,
) => {
    instance.interceptors.response.use(
        (response) => response,
        async (error) => {
            if (!isUnauthorized(error)) throw error;

            const originalRequest: AxiosRequestConfig & { _retry?: boolean } =
                error.config;

            if (originalRequest._retry) {
                dispatchCustomEvent(EVENTS_KEYS.UNAUTHORIZED);
                throw error;
            }
            originalRequest._retry = true;

            try {
                await refresh();
            } catch (refreshError) {
                dispatchCustomEvent(EVENTS_KEYS.UNAUTHORIZED);
                throw refreshError;
            }

            try {
                return await instance(originalRequest);
            } catch (retryError) {
                if (isUnauthorized(retryError)) {
                    dispatchCustomEvent(EVENTS_KEYS.UNAUTHORIZED);
                }
                throw retryError;
            }
        },
    );
};
