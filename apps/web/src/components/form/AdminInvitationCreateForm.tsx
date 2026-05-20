"use client";

import { Box } from "@mui/material";
import { StyledButton } from "@/components/ui/StyledButton";
import FormProvider from "@/components/wrappers/form/FormProvider";
import Form, { CustomSubmitHandler } from "@/components/wrappers/form/Form";
import { FormConfigProvider } from "@/components/wrappers/form/FormConfigProvider";
import FormTextField from "@/components/features/form/fields/controlled/FormTextField";
import SubmitButton from "@/components/features/form/SubmitButton";
import FormAlert from "@/components/features/form/FormAlert";
import useForm from "@/hooks/useForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { errorFormHandlerWithAlert } from "@/helpers/error/error.handler.helper";
import { snackbarSuccess } from "@/utils/snackbar/snackbar.success";
import AdminInvitationService from "@/services/admin/invitation/adminInvitation.service";
import { $apiAdminClient } from "@/utils/api/admin/fetch.admin.client";
import {
    CreateAdminInvitationSchema,
    CreateAdminInvitationDtoInput,
    CreateAdminInvitationDtoOutput,
} from "@myorg/shared/form";
import { useTranslations } from "next-intl";
import { useInvitationListCache } from "@/hooks/tanstack/useInvitationMutations";

const { create } = new AdminInvitationService($apiAdminClient);

interface Props {
    onCancel: () => void;
}

export default function AdminInvitationCreateForm({ onCancel }: Props) {
    const t = useTranslations();
    const { sync } = useInvitationListCache();

    const form = useForm<
        CreateAdminInvitationDtoInput,
        CreateAdminInvitationDtoOutput
    >({
        resolver: zodResolver(CreateAdminInvitationSchema),
        defaultValues: { email: "", note: "" },
    });

    const handleSubmit: CustomSubmitHandler<
        CreateAdminInvitationDtoInput,
        CreateAdminInvitationDtoOutput
    > = async (values, { setError }) => {
        try {
            const result = await create(values);
            snackbarSuccess(
                t("pages.admin.invitation.feedback.created", {
                    email: result.data.email,
                }),
            );
            sync();
            form.reset();
            onCancel();
        } catch (error) {
            errorFormHandlerWithAlert({
                error,
                t,
                formValues: values,
                setError,
            });
        }
    };

    return (
        <FormConfigProvider
            value={{
                fields: { variant: "outlined" },
                submit: {
                    variant: "contained",
                    text: "pages.admin.invitation.actions.create",
                },
            }}
        >
            <FormProvider form={form}>
                <Form<
                    CreateAdminInvitationDtoInput,
                    CreateAdminInvitationDtoOutput
                >
                    onSubmit={handleSubmit}
                    form={form}
                >
                    <Box display="flex" flexDirection="column" gap={2}>
                        <FormTextField<CreateAdminInvitationDtoInput>
                            name="email"
                            label="form.email.label"
                            type="email"
                            autoComplete="off"
                        />
                        <FormTextField<CreateAdminInvitationDtoInput>
                            name="note"
                            label="pages.admin.invitation.form.note"
                            multiline
                            helperText={t("form.optional")}
                            rows={2}
                        />
                        <FormAlert />
                        <Box
                            display="flex"
                            flexDirection={{ xs: "column", sm: "row" }}
                            gap={1}
                        >
                            <StyledButton
                                fullWidth
                                variant="outlined"
                                onClick={onCancel}
                            >
                                {t("common.cancel")}
                            </StyledButton>
                            <SubmitButton />
                        </Box>
                    </Box>
                </Form>
            </FormProvider>
        </FormConfigProvider>
    );
}
