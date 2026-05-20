// AUTH_EVENTS — просто объект с именами событий
export const EVENTS_KEYS = {
    UNAUTHORIZED: "auth:unauthorized",
} as const;

// dispatchAuthEvent — отправляет событие в браузер
export const dispatchCustomEvent = (event: string) =>
    window.dispatchEvent(new CustomEvent(event));
