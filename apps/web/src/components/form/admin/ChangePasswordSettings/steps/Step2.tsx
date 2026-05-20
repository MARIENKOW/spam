"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Box } from "@mui/material";
import { MailOutline } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { Dispatch, SetStateAction } from "react";

import FormProvider from "@/components/wrappers/form/FormProvider";
import Form, { CustomSubmitHandler } from "@/components/wrappers/form/Form";
import SubmitButton from "@/components/features/form/SubmitButton";
import FormAlert from "@/components/features/form/FormAlert";
import useForm from "@/hooks/useForm";
import { errorFormHandlerWithAlert } from "@/helpers/error/error.handler.helper";
import {
    CHANGE_PASSWORD_OTP_LENGTH,
    ChangePasswordCodeAdminDtoInput,
    ChangePasswordCodeAdminDtoOutput,
    ChangePasswordCodeAdminSchema,
} from "@myorg/shared/form";
import { StyledAlert } from "@/components/ui/StyledAlert";
import FormOtpInput from "@/components/features/form/fields/controlled/FormOtpInput";
import {
    ApiErrorResponse,
    ErrorsWithMessages,
    MailSendSuccess,
} from "@myorg/shared/dto";
import { useRouter } from "@/i18n/navigation";
import { snackbarSuccess } from "@/utils/snackbar/snackbar.success";
import ChangePasswordAdminService from "@/services/admin/changePassword.admin.service";
import { $apiAdminClient } from "@/utils/api/admin/fetch.admin.client";
import ResendPasswordChange from "@/components/form/admin/ChangePasswordSettings/features/ResendPasswordChange";
import CancelPasswordChange from "@/components/form/admin/ChangePasswordSettings/features/CancelPasswordChange";
import { useCountdown } from "@/hooks/useCountdown";

interface Props {
    mailSendSuccess: MailSendSuccess;
    setMailSendSuccess: Dispatch<SetStateAction<MailSendSuccess>>;
    onCancel: () => void;
}

const { confirm } = new ChangePasswordAdminService($apiAdminClient);

export default function Step2({
    mailSendSuccess,
    setMailSendSuccess,
    onCancel,
}: Props) {
    const t = useTranslations();
    const router = useRouter();
    const { label: expiresLabel } = useCountdown(mailSendSuccess.expiresAt);

    const form = useForm<ChangePasswordCodeAdminDtoInput>({
        resolver: zodResolver(ChangePasswordCodeAdminSchema),
        defaultValues: { code: "" },
    });

    const onSubmit: CustomSubmitHandler<
        ChangePasswordCodeAdminDtoOutput
    > = async (formValues, { setError }) => {
        try {
            await confirm(formValues);
            snackbarSuccess(t("features.changePassword.success"));
            router.refresh();
        } catch (error) {
            errorFormHandlerWithAlert({
                error,
                setError,
                t,
                formValues,
                fallback: {
                    notfound: {
                        callback: onCancel,
                    },
                    validation: {
                        callback() {
                            const { data } = error as ApiErrorResponse;
                            const { root } = data as ErrorsWithMessages;
                            if (root?.[0]?.data?.return) onCancel();
                        },
                    },
                },
            });
        }
    };

    return (
        <FormProvider<ChangePasswordCodeAdminDtoInput> form={form}>
            <Form<ChangePasswordCodeAdminDtoInput>
                form={form}
                onSubmit={onSubmit}
            >
                <Box display="flex" flexDirection="column" gap={6}>
                    <StyledAlert
                        severity="info"
                        icon={<MailOutline fontSize="small" />}
                    >
                        {t("features.changePassword.hint", {
                            email: mailSendSuccess.email,
                            time: expiresLabel,
                        })}
                    </StyledAlert>

                    <FormOtpInput
                        length={CHANGE_PASSWORD_OTP_LENGTH}
                        name="code"
                        label="form.code.label"
                    />

                    <Box display={"flex"} flexDirection={"column"} gap={1}>
                        <FormAlert />
                        <Box
                            display={"flex"}
                            flexWrap={"wrap"}
                            flexDirection={"column"}
                            gap={1}
                        >
                            <ResendPasswordChange
                                cooldownUntil={mailSendSuccess.cooldownUntil}
                                onCancel={onCancel}
                                setMailSendSuccess={setMailSendSuccess}
                            />
                            <CancelPasswordChange onCancel={onCancel} />
                        </Box>
                        <SubmitButton />
                    </Box>
                </Box>
            </Form>
        </FormProvider>
    );
}
