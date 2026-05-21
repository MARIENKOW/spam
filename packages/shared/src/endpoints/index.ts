// packages/shared/src/routing/routes.ts
export const ENDPOINT = {
    path: "",
    auth: {
        path: "auth",
        user: {
            path: "user",
            session: {
                path: "session",
            },
            login: {
                path: "login",
            },
            google: {
                path: "google",
            },
            forgotPassword: {
                path: "forgot-password",
            },
            refresh: {
                path: "refresh",
            },
            activate: {
                send: {
                    path: "send",
                },
                path: "activate",
            },
            changePassword: {
                path: "change-password",
            },
            register: {
                path: "register",
            },
            logout: {
                path: "logout",
            },
        },
        admin: {
            path: "admin",
            session: {
                path: "session",
            },
            login: {
                path: "login",
            },
            google: {
                path: "google",
            },
            forgotPassword: {
                path: "forgot-password",
            },
            refresh: {
                path: "refresh",
            },
            changePassword: {
                path: "change-password",
            },
            logout: {
                path: "logout",
            },
        },
    },
    user: {
        path: "user",
        me: {
            path: "me",
        },
        avatar: {
            path: "avatar",
        },
        theme: {
            path: "theme",
        },
        locale: {
            path: "locale",
        },
        changePassword: {
            path: "change-password",
            status: { path: "status" },
            confirm: { path: "confirm" },
            resend: { path: "resend" },
            init: { path: "init" },
            initWithoutPassword: { path: "initWithoutPassword" },
            cancel: {
                path: "cancel",
            },
        },
    },
    admin: {
        path: "admin",
        avatar: {
            path: "avatar",
        },
        me: {
            path: "me",
        },
        theme: {
            path: "theme",
        },
        locale: {
            path: "locale",
        },
        changePassword: {
            path: "change-password",
            status: { path: "status" },
            confirm: { path: "confirm" },
            resend: { path: "resend" },
            init: { path: "init" },
            initWithoutPassword: { path: "initWithoutPassword" },
            cancel: {
                path: "cancel",
            },
        },
        admins: {
            path: "admins",
            block: { path: "block" },
            unblock: { path: "unblock" },
            note: { path: "note" },
            sessions: { path: "sessions" },
        },
        users: {
            path: "users",
            block: { path: "block" },
            activate: { path: "activate" },
            note: { path: "note" },
            sessions: { path: "sessions" },
        },
        invitation: {
            path: "invitation",
            accept: { path: "accept" },
            revoke: { path: "revoke" },
            unrevoke: { path: "unrevoke" },
            resend: { path: "resend" },
            note: { path: "note" },
        },
    },
    blog: {
        path: "blog",
        video: {
            path: "video",
            upload: { path: "upload" },
        },
        image: {
            path: "image",
            upload: { path: "upload" },
        },
    },
    tgAccount: {
        path: "tg-accounts",
        auth: {
            path: "auth",
            start: { path: "start" },
            verify: { path: "verify" },
        },
        broadcast: {
            path: "broadcast",
            message: { path: "message" },
            channels: {
                path: "channels",
                search: { path: "search" },
            },
            progress: {
                path: "progress",
                recipients: { path: "recipients" },
            },
            history: { path: "history" },
            start: { path: "start" },
            stop: { path: "stop" },
        },
    },
    resetPasswordToken: {
        path: "reset-password-token",
        user: {
            check: { path: "check" },
            path: "user",
        },
        admin: {
            check: { path: "check" },
            path: "admin",
        },
    },
} as const;

type EdpointConfigType = typeof ENDPOINT;

type WithStringPath<T> = {
    [K in keyof T]: T[K] extends { path: any }
        ? { path: string } & WithStringPath<Omit<T[K], "path">>
        : T[K];
};

export function buildFullPaths<T extends Record<string, any>>(
    obj: T,
    result: any = {},
    parentPath: string = "",
): WithStringPath<T> {
    const currentPath =
        parentPath === "/"
            ? `${parentPath}${obj.path}`
            : `${parentPath}/${obj.path}`;
    result.path = currentPath;
    for (const key in obj) {
        const value = obj[key];

        if (typeof value === "object") {
            buildFullPaths(obj[key], (result[key] = {}), currentPath);
        }
    }

    return result;
}

export const FULL_PATH_ENDPOINT = buildFullPaths<EdpointConfigType>(ENDPOINT);

ENDPOINT.auth.user.login.path;
FULL_PATH_ENDPOINT.auth.user.login.path;
