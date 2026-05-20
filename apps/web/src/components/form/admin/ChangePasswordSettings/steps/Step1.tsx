"use client";

import { useEffect } from "react";
import { useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box } from "@mui/material";
import { useTranslations } from "next-intl";

import FormProvider from "@/components/wrappers/form/FormProvider";
import Form, { CustomSubmitHandler } from "@/components/wrappers/form/Form";
import FormPassword from "@/components/features/form/fields/controlled/FormPassword";
import SubmitButton from "@/components/features/form/SubmitButton";
import FormAlert from "@/components/features/form/FormAlert";
import useForm from "@/hooks/useForm";
import { errorFormHandlerWithAlert } from "@/helpers/error/error.handler.helper";
import {
    ChangePasswordSettingsAdminDtoInput,
    ChangePasswordSettingsAdminDtoOutput,
    ChangePasswordSettingsAdminSchema,
} from "@myorg/shared/form";
import { StyledDivider } from "@/components/ui/StyledDivider";
import { MailSendSuccess } from "@myorg/shared/dto";
import ChangePasswordAdminService from "@/services/admin/changePassword.admin.service";
import { $apiAdminClient } from "@/utils/api/admin/fetch.admin.client";

interface Props {
    onSuccess: (success: MailSendSuccess) => void;
}

const { init } = new ChangePasswordAdminService($apiAdminClient);

export default function Step1({ onSuccess }: Props) {
    const t = useTranslations();

    const form = useForm<ChangePasswordSettingsAdminDtoInput>({
        resolver: zodResolver(ChangePasswordSettingsAdminSchema),
        defaultValues: { currentPassword: "", newPassword: "", rePassword: "" },
    });

    const { trigger, control } = form;

    const [newPassword, rePassword, currentPassword] = useWatch({
        control,
        name: ["newPassword", "rePassword", "currentPassword"],
    });

    useEffect(() => {
        if (!newPassword || !currentPassword) return;
        trigger("newPassword");
    }, [currentPassword, newPassword, trigger]);

    useEffect(() => {
        if (!newPassword || !rePassword) return;
        trigger("rePassword");
    }, [newPassword, rePassword, trigger]);

    const onSubmit: CustomSubmitHandler<
        ChangePasswordSettingsAdminDtoOutput
    > = async (formValues, { setError }) => {
        try {
            const { data } = await init(formValues);
            onSuccess(data);
        } catch (error) {
            errorFormHandlerWithAlert({ error, setError, t, formValues });
        }
    };

    return (
        <FormProvider<ChangePasswordSettingsAdminDtoInput> form={form}>
            <Form<ChangePasswordSettingsAdminDtoInput>
                form={form}
                onSubmit={onSubmit}
            >
                <Box display="flex" flexDirection="column" gap={2}>
                    <FormPassword<ChangePasswordSettingsAdminDtoInput>
                        name="currentPassword"
                        label="form.currentPassword.label"
                    />
                    <StyledDivider />
                    <FormPassword<ChangePasswordSettingsAdminDtoInput>
                        name="newPassword"
                        label="form.newPassword.label"
                    />
                    <FormPassword<ChangePasswordSettingsAdminDtoInput>
                        name="rePassword"
                        label="form.rePassword.label"
                    />
                </Box>
                <FormAlert />
                <Box display={"flex"} mt={4}>
                    <SubmitButton />
                </Box>
            </Form>
        </FormProvider>
    );
}
