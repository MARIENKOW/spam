"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    IconButton,
    InputAdornment,
    TextField,
    Typography,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import RefreshIcon from "@mui/icons-material/Refresh";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useTranslations } from "next-intl";
import { StyledAlert } from "@/components/ui/StyledAlert";
import TgAccountService from "@/services/tg-account/tg-account.service";
import { $apiAdminClient } from "@/utils/api/admin/fetch.admin.client";

interface Props {
    onSuccess: () => void;
    onSwitchToPhone: () => void;
}

const service = new TgAccountService($apiAdminClient);
const POLL_INTERVAL_MS = 2000;

type ViewState = "loading" | "qr" | "needs2fa" | "expired" | "error";

export default function QrStep({ onSuccess, onSwitchToPhone }: Props) {
    const t = useTranslations();

    const [view, setView] = useState<ViewState>("loading");
    const [qrDataUrl, setQrDataUrl] = useState<string>("");
    const [tokenExpiresAt, setTokenExpiresAt] = useState<number>(0);
    const [password, setPassword] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [globalError, setGlobalError] = useState<string | null>(null);

    const sessionIdRef = useRef<string | null>(null);
    const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const activeRef = useRef(true);

    const stopPolling = () => {
        if (pollTimerRef.current) {
            clearTimeout(pollTimerRef.current);
            pollTimerRef.current = null;
        }
    };

    const cancelSession = useCallback((sid: string | null) => {
        stopPolling();
        if (sid) service.qrCancel(sid).catch(() => {});
    }, []);

    const scheduleNextPoll = useCallback((sid: string) => {
        pollTimerRef.current = setTimeout(async () => {
            if (!activeRef.current) return;
            try {
                const res = await service.qrPoll(sid);
                if (!activeRef.current) return;
                const data = res.data;

                if (data.qrDataUrl) setQrDataUrl(data.qrDataUrl);
                if (data.tokenExpiresAt) setTokenExpiresAt(data.tokenExpiresAt);

                if (data.status === "success") {
                    onSuccess();
                } else if (data.status === "needs2fa") {
                    setView("needs2fa");
                } else if (data.status === "expired") {
                    setView("expired");
                } else {
                    scheduleNextPoll(sid);
                }
            } catch {
                if (activeRef.current) setView("error");
            }
        }, POLL_INTERVAL_MS);
    }, [onSuccess]);

    const startQRSession = useCallback(async () => {
        setView("loading");
        setGlobalError(null);
        try {
            const res = await service.qrStart();
            if (!activeRef.current) {
                service.qrCancel(res.data.sessionId).catch(() => {});
                return;
            }
            const { sessionId, qrDataUrl: qr, tokenExpiresAt: exp } = res.data;
            sessionIdRef.current = sessionId;
            setQrDataUrl(qr);
            setTokenExpiresAt(exp);
            setView("qr");
            scheduleNextPoll(sessionId);
        } catch {
            if (activeRef.current) setView("error");
        }
    }, [scheduleNextPoll]);

    useEffect(() => {
        activeRef.current = true;
        startQRSession();
        return () => {
            activeRef.current = false;
            cancelSession(sessionIdRef.current);
        };
    }, []);

    const handleRetry = () => {
        cancelSession(sessionIdRef.current);
        sessionIdRef.current = null;
        setPassword("");
        setPasswordError(null);
        startQRSession();
    };

    const handle2faSubmit = async () => {
        const sid = sessionIdRef.current;
        if (!sid || !password.trim()) return;
        setPasswordError(null);
        setSubmitting(true);
        try {
            await service.qrVerify2fa(sid, password);
            onSuccess();
        } catch {
            setPasswordError(t("form.tgAccount.password.invalid"));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box display="flex" flexDirection="column" gap={3} alignItems="center">
            {view === "loading" && (
                <Box display="flex" flexDirection="column" alignItems="center" gap={2} py={4}>
                    <CircularProgress size={40} />
                    <Typography variant="body2" color="text.secondary">
                        {t("pages.admin.tgAccounts.add.qr.waiting")}
                    </Typography>
                </Box>
            )}

            {view === "qr" && (
                <>
                    <StyledAlert severity="info" sx={{ width: "100%" }}>
                        {t("pages.admin.tgAccounts.add.qr.hint")}
                    </StyledAlert>

                    <Box
                        sx={{
                            p: 2,
                            border: "2px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                            bgcolor: "background.paper",
                            lineHeight: 0,
                        }}
                    >
                        {qrDataUrl ? (
                            <img
                                src={qrDataUrl}
                                alt="Telegram QR login"
                                width={200}
                                height={200}
                                style={{ display: "block" }}
                            />
                        ) : (
                            <Box width={200} height={200} display="flex" alignItems="center" justifyContent="center">
                                <CircularProgress size={32} />
                            </Box>
                        )}
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                        {t("pages.admin.tgAccounts.add.qr.waiting")}
                    </Typography>
                </>
            )}

            {view === "needs2fa" && (
                <>
                    <StyledAlert severity="info" icon={<LockIcon fontSize="small" />} sx={{ width: "100%" }}>
                        {t("pages.admin.tgAccounts.add.qr.needs2faHint")}
                    </StyledAlert>

                    <TextField
                        fullWidth
                        type={passwordVisible ? "text" : "password"}
                        label={t("form.tgAccount.password.label")}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={!!passwordError}
                        helperText={passwordError}
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handle2faSubmit();
                        }}
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            size="small"
                                            onClick={() => setPasswordVisible((v) => !v)}
                                            edge="end"
                                        >
                                            {passwordVisible ? (
                                                <VisibilityOff fontSize="small" />
                                            ) : (
                                                <Visibility fontSize="small" />
                                            )}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />

                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handle2faSubmit}
                        loading={submitting}
                        disabled={!password.trim()}
                    >
                        {t("form.submit")}
                    </Button>
                </>
            )}

            {view === "expired" && (
                <>
                    <StyledAlert severity="warning" sx={{ width: "100%" }}>
                        {t("pages.admin.tgAccounts.add.qr.expired")}
                    </StyledAlert>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={handleRetry}
                        fullWidth
                    >
                        {t("pages.admin.tgAccounts.add.qr.retry")}
                    </Button>
                </>
            )}

            {view === "error" && (
                <>
                    <StyledAlert severity="error" sx={{ width: "100%" }}>
                        {globalError ?? t("pages.admin.tgAccounts.add.qr.error")}
                    </StyledAlert>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={handleRetry}
                        fullWidth
                    >
                        {t("pages.admin.tgAccounts.add.qr.retry")}
                    </Button>
                </>
            )}

            <Button
                variant="text"
                size="small"
                color="inherit"
                onClick={onSwitchToPhone}
                sx={{ color: "text.secondary" }}
            >
                {t("pages.admin.tgAccounts.add.qr.switchToPhone")}
            </Button>
        </Box>
    );
}
