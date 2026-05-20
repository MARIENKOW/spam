"use client";

import {
    CredentialResponse,
    GoogleLogin,
    useGoogleLogin,
    useGoogleOneTapLogin,
} from "@react-oauth/google";
import { StyledButton } from "@/components/ui/StyledButton";
import GoogleIcon from "@mui/icons-material/Google";
import { useRef, useState } from "react";
import AuthAdminService from "@/services/auth/admin/auth.admin.service";
import { $apiAdminClient } from "@/utils/api/admin/fetch.admin.client";
import { snackbarError } from "@/utils/snackbar/snackbar.error";
import { useTranslations } from "next-intl";
import { errorHandler } from "@/helpers/error/error.handler.helper";
import { snackbarSuccess } from "@/utils/snackbar/snackbar.success";
import { useRouter } from "@/i18n/navigation";
import { $apiClient } from "@/utils/api/fetch.client";

const auth = new AuthAdminService($apiClient);

export default function GoogleAuthButtonAdmin({
    redirectTo,
}: {
    redirectTo?: string;
}) {
    const [loading, setLoading] = useState<boolean>(false);

    const t = useTranslations();
    const router = useRouter();
    const login = useGoogleLogin({
        onSuccess: async (r) => {
            try {
                await auth.google({ code: r.code });
                snackbarSuccess(
                    t("pages.admin.login.feedback.success.loginSuccess"),
                );
                if (redirectTo) router.push(redirectTo);
                router.refresh();
            } catch (error) {
                errorHandler({ error, t });
            } finally {
                setLoading(false);
            }
        },
        onNonOAuthError: () => {
            setLoading(false);
        },
        onError: () => snackbarError(t("api.FALLBACK_ERR")),
        flow: "auth-code",
    });

    return (
        <StyledButton
            loading={loading}
            onClick={() => {
                setLoading(true);
                login();
            }}
            variant="outlined"
        >
            <GoogleIcon />
        </StyledButton>
    );
}
