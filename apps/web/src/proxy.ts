import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import {
    ADMIN_PATH,
    PRIVATE_USER_PATH,
    USER_PRIVATE_FALLBACK_ROUTE,
    PRIVATE_ADMIN_PATH,
    ADMIN_PRIVATE_FALLBACK_ROUTE,
} from "@myorg/shared/route";
import { NextRequest, NextResponse } from "next/server";
import {
    getPathnameWithoutLocale,
    isEqualPath,
} from "@/helpers/proxy/proxy.path.helper";
import AuthUserService from "@/services/auth/user/auth.user.service";
import AuthAdminService from "@/services/auth/admin/auth.admin.service";
import { $apiServer } from "@/utils/api/fetch.server";
import { isTokenExpired } from "@/helpers/jwt-token.helper";
import { parseSetCookie } from "next/dist/compiled/@edge-runtime/cookies";

const adminAuth = new AuthAdminService($apiServer);
const userAuth = new AuthUserService($apiServer);

const forwardSetCookies = (source: Response, target: NextResponse) => {
    source.headers.getSetCookie()?.forEach((cookie) => {
        const cookieRes = parseSetCookie(cookie);
        if (!cookieRes) return;
        target.cookies.set(cookieRes.name, cookieRes.value, cookieRes);
    });
};

export default async function Mid(req: NextRequest) {
    const { pathname, locale } = getPathnameWithoutLocale(req.nextUrl.pathname);

    const res = createMiddleware(routing)(req);
    res.headers.set("x-pathname", pathname);
    if (isEqualPath(ADMIN_PATH, pathname)) {
        const accessTokenAdmin = req.cookies.get("accessTokenAdmin")?.value;
        if (accessTokenAdmin) {
            if (isTokenExpired(accessTokenAdmin)) {
                try {
                    const refreshResponse = await adminAuth.refresh();
                    forwardSetCookies(refreshResponse, res);
                } catch {
                    // if (isEqualPath(PRIVATE_ADMIN_PATH, pathname)) {
                    //     const loginUrl = new URL(
                    //         locale
                    //             ? `/${locale}${ADMIN_PRIVATE_FALLBACK_ROUTE}`
                    //             : ADMIN_PRIVATE_FALLBACK_ROUTE,
                    //         req.url,
                    //     );
                    //     loginUrl.searchParams.set("callback", pathname);
                    //     return NextResponse.redirect(loginUrl);
                    // }
                }
            }
        } else {
            // if (isEqualPath(PRIVATE_ADMIN_PATH, pathname)) {
            //     const loginUrl = new URL(
            //         locale
            //             ? `/${locale}${ADMIN_PRIVATE_FALLBACK_ROUTE}`
            //             : ADMIN_PRIVATE_FALLBACK_ROUTE,
            //         req.url,
            //     );
            //     loginUrl.searchParams.set("callback", pathname);
            //     return NextResponse.redirect(loginUrl);
            // }
        }
    } else {
        const accessTokenUser = req.cookies.get("accessTokenUser")?.value;
        if (accessTokenUser) {
            if (isTokenExpired(accessTokenUser)) {
                try {
                    const refreshResponse = await userAuth.refresh();
                    forwardSetCookies(refreshResponse, res);
                } catch {
                    // if (isEqualPath(PRIVATE_USER_PATH, pathname)) {
                    //     const loginUrl = new URL(
                    //         locale
                    //             ? `/${locale}${USER_PRIVATE_FALLBACK_ROUTE}`
                    //             : USER_PRIVATE_FALLBACK_ROUTE,
                    //         req.url,
                    //     );
                    //     loginUrl.searchParams.set("callback", pathname);
                    //     return NextResponse.redirect(loginUrl);
                    // }
                }
            }
        } else {
            // if (isEqualPath(PRIVATE_USER_PATH, pathname)) {
            //     const loginUrl = new URL(
            //         locale
            //             ? `/${locale}${USER_PRIVATE_FALLBACK_ROUTE}`
            //             : USER_PRIVATE_FALLBACK_ROUTE,
            //         req.url,
            //     );
            //     loginUrl.searchParams.set("callback", pathname);
            //     return NextResponse.redirect(loginUrl);
            // }
        }
    }
    return res;
}

export const config = {
    matcher: [
        "/((?!api|nextApi|_next/static|_next/image|favicon.ico|.*\\..*).*)",
    ],
};
