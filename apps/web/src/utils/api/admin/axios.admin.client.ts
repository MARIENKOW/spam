import axios from "axios";
import { $apiClient } from "@/utils/api/fetch.client";
import AuthAdminService from "@/services/auth/admin/auth.admin.service";
import { axiosClientConfig, apply401Interceptor } from "@/utils/api/axios.client";

const { refresh } = new AuthAdminService($apiClient);

export const $apiAdminAxiosClient = axios.create({
    ...axiosClientConfig,
    headers: { "x-type": "ADMIN" },
});

apply401Interceptor($apiAdminAxiosClient, refresh);
