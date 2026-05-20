"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { errorFormHandlerWithAlert } from "@/helpers/error/error.handler.helper";
import { useTranslations } from "next-intl";
import FormFilledTextField from "@/components/features/form/fields/controlled/FormTextField";
import { CustomSubmitHandler } from "@/components/wrappers/form/Form";
import SubmitButton from "@/components/features/form/SubmitButton";
import FormAlert from "@/components/features/form/FormAlert";
import SimpleForm from "@/components/wrappers/form/SimpleForm";
import AuthAdminService from "@/services/auth/admin/auth.admin.service";
import {
    ForgotPasswordAdminDtoInput,
    ForgotPasswordAdminDtoOutput,
    ForgotPasswordAdminSchema,
} from "@myorg/shared/form";
import { $apiClient } from "@/utils/api/fetch.client";

import { snackbarSuccess } from "@/utils/snackbar/snackbar.success";

import { Box } from "@mui/material";

const authAdmin = new AuthAdminService($apiClient);

export default function AdminRememberPasswordForm() {
    const t = useTranslations();

    const onSubmit: CustomSubmitHandler<ForgotPasswordAdminDtoOutput> = async (
        formValues,
        { setError },
    ) => {
        try {
            const { data } = await authAdmin.forgotPassword(formValues);
            snackbarSuccess(data);
        } catch (error) {
            errorFormHandlerWithAlert({ error, setError, t, formValues });
        }
    };

    return (
        <SimpleForm<ForgotPasswordAdminDtoInput>
            params={{
                resolver: zodResolver(ForgotPasswordAdminSchema),
                defaultValues: {
                    email: "",
                },
            }}
            onSubmit={onSubmit}
        >
            <FormFilledTextField<ForgotPasswordAdminDtoInput>
                label={"form.email.label"}
                name={"email"}
            />
            <Box mt={2} gap={2} display={"flex"} flexDirection={"column"}>
                <FormAlert />
                <SubmitButton />
            </Box>
        </SimpleForm>
    );
}
