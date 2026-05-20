import ErrorHandlerElement from "@/components/feedback/error/ErrorHandlerElement";
import AdminInvitationRegisterForm from "@/components/form/admin/invitation/AdminInvitationRegisterForm";
import { ContainerComponent } from "@/components/ui/Container";
import { redirect } from "@/i18n/navigation";
import { $apiServer } from "@/utils/api/fetch.server";
import AdminInvitationAcceptService from "@/services/admin/invitation/adminInvitationAccept.service";
import { Box, Typography } from "@mui/material";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";
import { getLocale, getTranslations } from "next-intl/server";
import InvitationTokenErrorElement from "@/app/[locale]/admin/(dashboard)/invitation/InvitationTokenErrorElement";
import RedirectWithMessage from "@/components/common/RedirectWithMessage";

const service = new AdminInvitationAcceptService($apiServer);

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ token?: string }>;
}) {
    const { token } = await searchParams;

    if (!token) {
        const locale = await getLocale();
        redirect({ href: FULL_PATH_ROUTE.admin.path, locale });
    }

    const t = await getTranslations();

    try {
        const { data } = await service.check(token as string);
        return (
            <ContainerComponent>
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flex={1}
                >
                    <Box flex="0 1 350px" display="flex" flexDirection="column">
                        <Typography
                            fontWeight={600}
                            color="primary"
                            sx={{ textAlign: "center", mb: 3 }}
                            variant="h6"
                            component="h2"
                        >
                            {t("pages.admin.invitation.register.title")}
                        </Typography>
                        <AdminInvitationRegisterForm email={data.email} />
                    </Box>
                </Box>
            </ContainerComponent>
        );
    } catch (error) {
        return (
            <ErrorHandlerElement
                fallback={{
                    notfound: {
                        element: (
                            <RedirectWithMessage
                                type="error"
                                path={FULL_PATH_ROUTE.admin.path}
                                message={t("api.NOT_FOUND")}
                            />
                        ),
                    },
                    validation: {
                        element: <InvitationTokenErrorElement error={error} />,
                    },
                }}
                error={error}
            />
        );
    }
}
