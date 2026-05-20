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
    ChangePasswordUserDtoInput,
    ChangePasswordUserDtoOutput,
    ChangePasswordUserSchema,
} from "@myorg/shared/form";
import { MailSendSuccess } from "@myorg/shared/dto";
import ChangePasswordUserService from "@/services/user/changePassword.user.service";
import { $apiUserClient } from "@/utils/api/user/fetch.user.client";

interface Props {
    onSuccess: (success: MailSendSuccess) => void;
}

const { initWithoutPassword } = new ChangePasswordUserService($apiUserClient);

export default function Step1WithoutPassword({ onSuccess }: Props) {
    const t = useTranslations();

    const form = useForm<ChangePasswordUserDtoInput>({
        resolver: zodResolver(ChangePasswordUserSchema),
        defaultValues: { password: "", rePassword: "" },
    });

    const { trigger, control } = form;

    const [password, rePassword] = useWatch({
        control,
        name: ["password", "rePassword"],
    });

    useEffect(() => {
        if (!password || !rePassword) return;
        trigger("rePassword");
    }, [password, rePassword, trigger]);

    const onSubmit: CustomSubmitHandler<ChangePasswordUserDtoOutput> = async (
        formValues,
        { setError },
    ) => {
        try {
            const { data } = await initWithoutPassword(formValues);
            onSuccess(data);
        } catch (error) {
            errorFormHandlerWithAlert({ error, setError, t, formValues });
        }
    };

    return (
        <FormProvider<ChangePasswordUserDtoInput> form={form}>
            <Form<ChangePasswordUserDtoInput> form={form} onSubmit={onSubmit}>
                <Box display="flex" flexDirection="column" gap={2}>
                    <FormPassword<ChangePasswordUserDtoInput>
                        name="password"
                        label="form.newPassword.label"
                    />
                    <FormPassword<ChangePasswordUserDtoInput>
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
