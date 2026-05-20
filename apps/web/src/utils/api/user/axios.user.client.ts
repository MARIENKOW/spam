import axios from "axios";
import { $apiClient } from "@/utils/api/fetch.client";
import AuthUserService from "@/services/auth/user/auth.user.service";
import { axiosClientConfig, apply401Interceptor } from "@/utils/api/axios.client";

const { refresh } = new AuthUserService($apiClient);

export const $apiUserAxiosClient = axios.create({
    ...axiosClientConfig,
    headers: { "x-type": "USER" },
});

apply401Interceptor($apiUserAxiosClient, refresh);
