import { clientEnv } from "@/config/env.client";
import { serverEnv } from "@/config/env.server";

export const API_SERVER_BASE_URL = `${serverEnv.API_ORIGIN_SERVER}/${clientEnv.NEXT_PUBLIC_API_GLOBAL_PREFIX}`;
