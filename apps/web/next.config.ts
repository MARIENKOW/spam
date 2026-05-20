import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), "../../.env") });

process.env.ALLOWED_ORIGIN?.split(",") || [];

const nextConfig: NextConfig = {
    reactCompiler: true,
    // compiler: {
    //     removeConsole: {
    //         exclude: ["error", "warn"], // оставить error и warn, удалить log, info и т.д.
    //     },
    // },
    allowedDevOrigins: process.env.ALLOWED_ORIGIN?.split(",") || [],
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
