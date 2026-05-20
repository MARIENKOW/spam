"use server";

import axios from "axios";
import { axiosServerConfig, applyCookieInterceptor } from "@/utils/api/axios.server";

export const $apiAdminAxiosServer = axios.create({
    ...axiosServerConfig,
    headers: { "x-type": "ADMIN" },
});

applyCookieInterceptor($apiAdminAxiosServer);
