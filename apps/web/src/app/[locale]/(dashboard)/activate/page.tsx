import RedirectWithMessage from "@/components/common/RedirectWithMessage";
import ActivateErrorElement from "@/app/[locale]/(dashboard)/activate/ActivateErrorElement";
import ErrorHandlerElement from "@/components/feedback/error/ErrorHandlerElement";
import { redirect } from "@/i18n/navigation";
import { $apiServer } from "@/utils/api/fetch.server";
import AuthUserService from "@/services/auth/user/auth.user.service";
import { Box, Typography } from "@mui/material";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";
import { getLocale, getTranslations } from "next-intl/server";

const authUser = new AuthUserService($apiServer);

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<any>;
}) {
    const { token } = await searchParams;
    const locale = await getLocale();
    const t = await getTranslations();
    if (!token) {
        redirect({ href: FULL_PATH_ROUTE.path, locale });
    }
    try {
        await authUser.activate({ token });
        return (
            <RedirectWithMessage
                message={t("pages.activate.feedback.success.accountActivate")}
                type="success"
                path={FULL_PATH_ROUTE.login.path}
            />
        );
    } catch (error) {
        return (
            <ErrorHandlerElement
                fallback={{
                    notfound: {
                        element: (
                            <RedirectWithMessage
                                message={t("api.NOT_FOUND")}
                                type="error"
                                path={FULL_PATH_ROUTE.path}
                            />
                        ),
                    },
                    validation: {
                        element: <ActivateErrorElement error={error} />,
                    },
                }}
                error={error}
            />
        );
    }
}
