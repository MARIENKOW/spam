export const HTTP_STATUSES = {
    NetworkError: {
        status: 0,
        statusText: "Network Error",
        code: "NETWORK_ERROR",
    },
    AbortError: {
        status: 0,
        statusText: "Request aborted",
        code: "ABORT_ERROR",
    },

    OK: { status: 200, statusText: "OK", code: "OK" },
    Created: { status: 201, statusText: "Created", code: "CREATED" },
    Accepted: { status: 202, statusText: "Accepted", code: "ACCEPTED" },
    NoContent: { status: 204, statusText: "No Content", code: "NO_CONTENT" },

    MovedPermanently: {
        status: 301,
        statusText: "Moved Permanently",
        code: "MOVED_PERMANENTLY",
    },
    Found: { status: 302, statusText: "Found", code: "FOUND" },
    SeeOther: { status: 303, statusText: "See Other", code: "SEE_OTHER" },
    NotModified: {
        status: 304,
        statusText: "Not Modified",
        code: "NOT_MODIFIED",
    },
    TemporaryRedirect: {
        status: 307,
        statusText: "Temporary Redirect",
        code: "TEMPORARY_REDIRECT",
    },

    ValidationFailed: {
        status: 400,
        statusText: "Validation failed",
        code: "VALIDATION_ERROR",
    },
    BadRequest: {
        status: 400,
        statusText: "Bad request",
        code: "BAD_REQUEST",
    },
    Unauthorized: {
        status: 401,
        statusText: "Unauthorized",
        code: "UNAUTHORIZED",
    },
    Forbidden: { status: 403, statusText: "Forbidden", code: "FORBIDDEN" },
    NotFound: { status: 404, statusText: "Not Found", code: "NOT_FOUND" },
    MethodNotAllowed: {
        status: 405,
        statusText: "Method Not Allowed",
        code: "METHOD_NOT_ALLOWED",
    },
    Conflict: { status: 409, statusText: "Conflict", code: "CONFLICT" },
    UnprocessableEntity: {
        status: 422,
        statusText: "Unprocessable Entity",
        code: "UNPROCESSABLE_ENTITY",
    },
    TooManyRequests: {
        status: 429,
        statusText: "Too Many Requests",
        code: "TOO_MANY_REQUESTS",
    },

    InternalServerError: {
        status: 500,
        statusText: "Internal Server Error",
        code: "INTERNAL_SERVER_ERROR",
    },
    NotImplemented: {
        status: 501,
        statusText: "Not Implemented",
        code: "NOT_IMPLEMENTED",
    },
    BadGateway: { status: 502, statusText: "Bad Gateway", code: "BAD_GATEWAY" },
    ServiceUnavailable: {
        status: 503,
        statusText: "Service Unavailable",
        code: "SERVICE_UNAVAILABLE",
    },
    GatewayTimeout: {
        status: 504,
        statusText: "Gateway Timeout",
        code: "GATEWAY_TIMEOUT",
    },
} as const satisfies Record<
    string,
    { status: number; statusText: string; code: string }
>;
