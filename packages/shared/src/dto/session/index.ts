export interface SessionViewDto {
    id: string;
    isCurrent: boolean;
    device: {
        browser: string; // "Chrome 146"
        os: string; // "Windows 10"
        type: "desktop" | "mobile" | "tablet" | "unknown";
        icon: "windows" | "macos" | "linux" | "android" | "ios" | "unknown";
    };
    location: {
        city: string; // "Kyiv"
        country: string; // "Ukraine"
        ip: string; // "192.168.1.104" — только в локалке без гео
    };
    createdAt: string;
    lastUsedAt: string;
}
