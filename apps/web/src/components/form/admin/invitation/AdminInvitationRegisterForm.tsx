"use client";

import {
    RegisterByInvitationAdminSchema,
    RegisterByInvitationAdminDtoInput,
    RegisterByInvitationAdminDtoOutput,
} from "@myorg/shared/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { errorFormHandlerWithAlert } from "@/helpers/error/error.handler.helper";
import { useTranslations } from "next-intl";
import Form, { CustomSubmitHandler } from "@/components/wrappers/form/Form";
import SubmitButton from "@/components/features/form/SubmitButton";
import FormAlert from "@/components/features/form/FormAlert";
import FormPassword from "@/components/features/form/fields/controlled/FormPassword";
import useForm from "@/hooks/useForm";
import FormProvider from "@/components/wrappers/form/FormProvider";
import { useEffect } from "react";
import { useWatch } from "react-hook-form";
import { useRouter } from "@/i18n/navigation";
import { snackbarSuccess } from "@/utils/snackbar/snackbar.success";
import { Box } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";
import AdminInvitationAcceptService from "@/services/admin/invitation/adminInvitationAccept.service";
import { $apiClient } from "@/utils/api/fetch.client";
import { StyledTextField } from "@/components/ui/StyledTextField";

const service = new AdminInvitationAcceptService($apiClient);

interface Props {
    email: string;
}

export default function AdminInvitationRegisterForm({ email }: Props) {
    const t = useTranslations();
    const router = useRouter();
    const searchParams = useSearchParams();

    const form = useForm<
        RegisterByInvitationAdminDtoInput,
        RegisterByInvitationAdminDtoOutput
    >({
        resolver: zodResolver(RegisterByInvitationAdminSchema),
        defaultValues: { password: "", rePassword: "" },
    });

    const { trigger, control } = form;

    const password = useWatch<RegisterByInvitationAdminDtoInput>({
        name: "password",
        control,
    });
    const rePassword = useWatch<RegisterByInvitationAdminDtoInput>({
        name: "rePassword",
        control,
    });

    useEffect(() => {
        if (!password || !rePassword) return;
        trigger("rePassword");
    }, [password, trigger, rePassword]);

    const onSubmit: CustomSubmitHandler<
        RegisterByInvitationAdminDtoInput,
        RegisterByInvitationAdminDtoOutput
    > = async (formValues, { setError }) => {
        try {
            const token = searchParams.get("token") as string;
            await service.register(token, formValues);
            snackbarSuccess(
                t("pages.admin.invitation.register.feedback.success"),
            );
            router.push(FULL_PATH_ROUTE.admin.login.path);
        } catch (error) {
            errorFormHandlerWithAlert({ error, setError, t, formValues });
        }
    };

    return (
        <FormProvider<RegisterByInvitationAdminDtoInput> form={form}>
            <Form<
                RegisterByInvitationAdminDtoInput,
                RegisterByInvitationAdminDtoOutput
            >
                form={form}
                onSubmit={onSubmit}
            >
                <Box display="flex" flexDirection="column" gap={2}>
                    <StyledTextField
                        label={t("form.email.label")}
                        value={email}
                        disabled
                        variant='filled'
                        fullWidth
                    />
                    <FormPassword<RegisterByInvitationAdminDtoInput>
                        name="password"
                        label="form.password.label"
                    />
                    <FormPassword<RegisterByInvitationAdminDtoInput>
                        name="rePassword"
                        label="form.rePassword.label"
                    />
                    <FormAlert />
                    <SubmitButton />
                </Box>
            </Form>
        </FormProvider>
    );
}
