const BUFFER_MS = 10_000;

export function isTokenExpired(token: string): boolean {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.exp * 1000 < Date.now() + BUFFER_MS;
    } catch {
        return true;
    }
}
