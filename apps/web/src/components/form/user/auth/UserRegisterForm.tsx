"use client";

import {
    RegisterUserDtoInput,
    RegisterUserDtoOutput,
    RegisterUserSchema,
} from "@myorg/shared/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { errorFormHandlerWithAlert } from "@/helpers/error/error.handler.helper";
import { useTranslations } from "next-intl";
import FormFilledTextField from "@/components/features/form/fields/controlled/FormTextField";
import Form, { CustomSubmitHandler } from "@/components/wrappers/form/Form";
import SubmitButton from "@/components/features/form/SubmitButton";
import FormAlert from "@/components/features/form/FormAlert";
import FormPassword from "@/components/features/form/fields/controlled/FormPassword";
import useForm from "@/hooks/useForm";
import FormProvider from "@/components/wrappers/form/FormProvider";
import { useEffect } from "react";
import { useWatch } from "react-hook-form";
import { StyledDivider } from "@/components/ui/StyledDivider";
import GoogleAuthButtonUser from "@/components/features/auth/user/GoogleAuthButton.user";
import { useRouter } from "@/i18n/navigation";
import AuthUserService from "@/services/auth/user/auth.user.service";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";
import { snackbarSuccess } from "@/utils/snackbar/snackbar.success";
import { Box } from "@mui/material";
import { $apiClient } from "@/utils/api/fetch.client";

const authUser = new AuthUserService($apiClient);

export default function UserRegisterForm() {
    const t = useTranslations();
    const router = useRouter();

    const form = useForm<RegisterUserDtoInput>({
        resolver: zodResolver(RegisterUserSchema),
        defaultValues: {
            email: "",
            password: "",
            rePassword: "",
        },
    });

    const { trigger, control } = form;

    const password = useWatch<RegisterUserDtoInput>({
        name: "password",
        control,
    });
    const rePassword = useWatch<RegisterUserDtoInput>({
        name: "rePassword",
        control,
    });

    useEffect(() => {
        if (!password || !rePassword) return;
        trigger("rePassword");
    }, [password, trigger, rePassword]);

    const onSubmit: CustomSubmitHandler<RegisterUserDtoOutput> = async (
        formValues,
        { setError },
    ) => {
        try {
            const { data } = await authUser.register(formValues);
            snackbarSuccess(data);
            router.push(FULL_PATH_ROUTE.login.path);
        } catch (error) {
            errorFormHandlerWithAlert({ error, setError, t, formValues });
        }
    };

    return (
        <FormProvider<RegisterUserDtoInput> form={form}>
            <Form<RegisterUserDtoInput> form={form} onSubmit={onSubmit}>
                <FormFilledTextField<RegisterUserDtoInput>
                    label={"form.email.label"}
                    name={"email"}
                />
                <FormPassword<RegisterUserDtoInput>
                    name="password"
                    label="form.password.label"
                />
                <FormPassword<RegisterUserDtoInput>
                    name="rePassword"
                    label="form.rePassword.label"
                />
                <Box mt={2} gap={2} display={"flex"} flexDirection={"column"}>
                    <FormAlert />
                    <SubmitButton />
                </Box>
                <StyledDivider />
                <GoogleAuthButtonUser />
            </Form>
        </FormProvider>
    );
}
