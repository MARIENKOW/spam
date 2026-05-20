import { SessionAdmin } from "@/generated/prisma";
import { SessionAdminDto, SessionAdminViewDto } from "@myorg/shared/dto";
import * as geoip from "geoip-lite";
import { UAParser } from "ua-parser-js";

export const mapSessionAdmin = (
    SessionAdmin: SessionAdmin,
): SessionAdminDto => ({
    id: SessionAdmin.id,
    userAgent: SessionAdmin.userAgent,
    ip: SessionAdmin.ip,
    createdAt: SessionAdmin.createdAt,
    lastUsedAt: SessionAdmin.lastUsedAt,
});

const OS_ICON_MAP: Record<string, SessionAdminViewDto["device"]["icon"]> = {
    windows: "windows",
    "mac os": "macos",
    linux: "linux",
    android: "android",
    ios: "ios",
};

const DEVICE_TYPE_MAP: Record<string, SessionAdminViewDto["device"]["type"]> = {
    mobile: "mobile",
    tablet: "tablet",
};

export const mapSessionAdminView = (
    session: SessionAdmin,
    currentSessionId: string,
): SessionAdminViewDto => {
    // ── Device ────────────────────────────────────────────────────────────────
    const ua = new UAParser(session.userAgent ?? undefined).getResult();

    const browser =
        [ua.browser.name, ua.browser.major].filter(Boolean).join(" ") ||
        "Unknown browser";

    const os =
        [ua.os.name, ua.os.version].filter(Boolean).join(" ") || "Unknown OS";

    const osKey = ua.os.name?.toLowerCase() ?? "";
    const icon =
        Object.entries(OS_ICON_MAP).find(([k]) => osKey.includes(k))?.[1] ??
        "unknown";
    const type = DEVICE_TYPE_MAP[ua.device.type ?? ""] ?? "desktop";

    // ── Location ──────────────────────────────────────────────────────────────
    const cleanIp = (session.ip ?? "").replace(/^::ffff:/, "");
    const geo = geoip.lookup(cleanIp);

    const location: SessionAdminViewDto["location"] = geo
        ? {
              city: geo.city || geo.region || "",
              country: geo.country
                  ? (new Intl.DisplayNames(["en"], { type: "region" }).of(
                        geo.country,
                    ) ?? geo.country)
                  : "Unknown country",
              ip: cleanIp,
          }
        : {
              city: "Local network",
              country: "",
              ip: cleanIp,
          };

    return {
        id: session.id,
        isCurrent: session.id === currentSessionId,
        device: { browser, os, type, icon },
        location,
        createdAt: session.createdAt.toISOString(),
        lastUsedAt: session.lastUsedAt.toISOString(),
    };
};
