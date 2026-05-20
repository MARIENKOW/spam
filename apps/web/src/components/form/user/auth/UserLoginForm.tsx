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
import AuthUserService from "@/services/auth/user/auth.user.service";
import { LoginUserDtoInput, LoginUserSchema } from "@myorg/shared/form";
import { snackbarSuccess } from "@/utils/snackbar/snackbar.success";
import { Box } from "@mui/material";
import { ApiErrorResponse, ErrorsWithMessages } from "@myorg/shared/dto";
import { useState } from "react";
import ActivateButton from "@/components/features/auth/user/ActivateButton";
import { StyledDivider } from "@/components/ui/StyledDivider";
import GoogleAuthButtonUser from "@/components/features/auth/user/GoogleAuthButton.user";
import { $apiClient } from "@/utils/api/fetch.client";

const authUser = new AuthUserService($apiClient);

export default function UserLoginForm({ redirectTo }: { redirectTo?: string }) {
    const router = useRouter();
    const t = useTranslations();
    const [isShowButton, setIsShowButton] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");

    const onSubmit: CustomSubmitHandler<LoginUserDtoInput> = async (
        formValues,
        { setError },
    ) => {
        setIsShowButton(false);
        try {
            await authUser.login(formValues);
            snackbarSuccess(t("pages.login.feedback.success.loginSuccess"));
            if (redirectTo) router.push(redirectTo);
            router.refresh();
        } catch (error) {
            errorFormHandlerWithAlert<LoginUserDtoInput>({
                error,
                setError,
                formValues,
                fallback: {
                    validation: {
                        callback: () => {
                            const { data }: { data: ErrorsWithMessages } =
                                error as ApiErrorResponse;
                            if (data.root?.[0]?.data?.isShowButton) {
                                setIsShowButton(true);
                                setEmail(formValues.email);
                            }
                        },
                    },
                },
                t,
            });
        }
    };

    return (
        <SimpleForm<LoginUserDtoInput>
            params={{
                resolver: zodResolver(LoginUserSchema),
                defaultValues: {
                    email: "",
                    password: "",
                },
            }}
            onSubmit={onSubmit}
        >
            <FormFilledTextField<LoginUserDtoInput>
                label={"form.email.label"}
                name={"email"}
            />
            <FormPassword<LoginUserDtoInput>
                name="password"
                label="form.password.label"
            />
            <Box mt={2} gap={2} display={"flex"} flexDirection={"column"}>
                <FormAlert />
                {isShowButton && (
                    <ActivateButton
                        afterFetch={() => setIsShowButton(false)}
                        email={email}
                    />
                )}
                <SubmitButton />
            </Box>
            <StyledDivider />
            <GoogleAuthButtonUser redirectTo={redirectTo} />
        </SimpleForm>
    );
}
