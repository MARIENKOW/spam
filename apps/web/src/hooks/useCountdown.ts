"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { formatDuration } from "@myorg/shared/utils";
import { AvailableLanguage } from "@myorg/shared/i18n";

export function useCountdown(expiresAt: string | null): { remaining: number; label: string } {
    const locale = useLocale() as AvailableLanguage;

    const getRemaining = () =>
        expiresAt ? Math.max(0, new Date(expiresAt).getTime() - Date.now()) : 0;

    const [remaining, setRemaining] = useState(getRemaining);

    useEffect(() => {
        if (!expiresAt) { setRemaining(0); return; }
        setRemaining(getRemaining());
        const id = setInterval(() => setRemaining(getRemaining()), 1_000);
        return () => clearInterval(id);
    }, [expiresAt]);

    return {
        remaining,
        label: remaining > 0 ? formatDuration(remaining, locale) : "",
    };
}
