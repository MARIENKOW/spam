"use server";

import axios from "axios";
import { axiosServerConfig, applyCookieInterceptor } from "@/utils/api/axios.server";

export const $apiUserAxiosServer = axios.create({
    ...axiosServerConfig,
    headers: { "x-type": "USER" },
});

applyCookieInterceptor($apiUserAxiosServer);
