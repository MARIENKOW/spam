"use client";

import { RevokeSessionButton } from "@/components/features/auth/session/RevokeSessionButton";
import { FetchCustomReturn } from "@/utils/api";

interface Props {
    onRevoke: () => FetchCustomReturn<void>;
}

export function RevokeSessionAction({ onRevoke }: Props) {
    return (
        <>
            <RevokeSessionButton
                onRevoke={onRevoke}
                fullWidth
                variant="outlined"
                sx={{ display: { xs: "flex", sm: "none" } }}
            />
            <RevokeSessionButton
                onRevoke={onRevoke}
                variant="text"
                sx={{ display: { xs: "none", sm: "flex" } }}
            />
        </>
    );
}
