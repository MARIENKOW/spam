"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { errorFormHandlerWithAlert } from "@/helpers/error/error.handler.helper";
import { useTranslations } from "next-intl";
import FormFilledTextField from "@/components/features/form/fields/controlled/FormTextField";
import { CustomSubmitHandler } from "@/components/wrappers/form/Form";
import SubmitButton from "@/components/features/form/SubmitButton";
import FormAlert from "@/components/features/form/FormAlert";
import FormPassword from "@/components/features/form/fields/controlled/FormPassword";
import SimpleForm from "@/components/wrappers/form/SimpleForm";
import { useRouter } from "@/i18n/navigation";
import AuthAdminService from "@/services/auth/admin/auth.admin.service";
import { LoginAdminDtoInput, LoginAdminSchema } from "@myorg/shared/form";
import { snackbarSuccess } from "@/utils/snackbar/snackbar.success";
import { Box } from "@mui/material";
import { StyledDivider } from "@/components/ui/StyledDivider";
import { $apiClient } from "@/utils/api/fetch.client";
import GoogleAuthButtonAdmin from "@/components/features/auth/admin/GoogleAuthButton.admin";

const authAdmin = new AuthAdminService($apiClient);

export default function AdminLoginForm({
    redirectTo,
}: {
    redirectTo?: string;
}) {
    const router = useRouter();
    const t = useTranslations();

    const onSubmit: CustomSubmitHandler<LoginAdminDtoInput> = async (
        formValues,
        { setError },
    ) => {
        try {
            await authAdmin.login(formValues);
            snackbarSuccess(
                t("pages.admin.login.feedback.success.loginSuccess"),
            );
            if (redirectTo) router.push(redirectTo);
            router.refresh();
        } catch (error) {
            errorFormHandlerWithAlert<LoginAdminDtoInput>({
                error,
                setError,
                formValues,
                t,
            });
        }
    };

    return (
        <SimpleForm<LoginAdminDtoInput>
            params={{
                resolver: zodResolver(LoginAdminSchema),
                defaultValues: {
                    email: "",
                    password: "",
                },
            }}
            onSubmit={onSubmit}
        >
            <FormFilledTextField<LoginAdminDtoInput>
                label={"form.email.label"}
                name={"email"}
            />
            <FormPassword<LoginAdminDtoInput>
                name="password"
                label="form.password.label"
            />
            <Box mt={2} gap={2} display={"flex"} flexDirection={"column"}>
                <FormAlert />
                <SubmitButton />
            </Box>
            <StyledDivider />
            <GoogleAuthButtonAdmin redirectTo={redirectTo} />
        </SimpleForm>
    );
}
