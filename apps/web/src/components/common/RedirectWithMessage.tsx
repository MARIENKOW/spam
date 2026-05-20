"use client";

import { useRouter } from "@/i18n/navigation";
import { snackbarError } from "@/utils/snackbar/snackbar.error";
import { snackbarInfo } from "@/utils/snackbar/snackbar.info";
import { snackbarSuccess } from "@/utils/snackbar/snackbar.success";
import { snackbarWarning } from "@/utils/snackbar/snackbar.warning";
import { useEffect, useRef } from "react";

type MessageType = "success" | "error" | "warning" | "info";
const SnackbarType: { [K in MessageType]: (value: string) => void } = {
    success: snackbarSuccess,
    error: snackbarError,
    warning: snackbarWarning,
    info: snackbarInfo,
};
export default function RedirectWithMessage({
    message,
    path,
    type,
}: {
    message: string;
    type: MessageType;
    path: string;
}) {
    const router = useRouter();
    const ranRef = useRef(false);
    useEffect(() => {
        if (ranRef.current) return;
        ranRef.current = true;
        const snackbar = SnackbarType[type];
        snackbar(message);
        router.push(path);
    }, [router, path, type, message, SnackbarType]);
    return null;
}
