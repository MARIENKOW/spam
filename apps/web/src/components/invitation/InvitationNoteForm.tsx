"use client";

import { InputAdornment } from "@mui/material";
import DoubleArrowIcon from "@mui/icons-material/DoubleArrow";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import useForm from "@/hooks/useForm";
import FormProvider from "@/components/wrappers/form/FormProvider";
import Form, { CustomSubmitHandler } from "@/components/wrappers/form/Form";
import FormTextField from "@/components/features/form/fields/controlled/FormTextField";
import { StyledButton } from "@/components/ui/StyledButton";
import AdminInvitationService from "@/services/admin/invitation/adminInvitation.service";
import { $apiAdminClient } from "@/utils/api/admin/fetch.admin.client";
import { errorFormHandler } from "@/helpers/error/error.handler.helper";
import { snackbarSuccess } from "@/utils/snackbar/snackbar.success";
import {
    UpdateNoteAdminInvitationSchema,
    UpdateNoteAdminInvitationDtoInput,
    UpdateNoteAdminInvitationDtoOutput,
} from "@myorg/shared/form";
import { AdminInvitationDto } from "@myorg/shared/dto";
import { useInvitationListCache } from "@/hooks/tanstack/useInvitationMutations";
import { useEffect } from "react";

const service = new AdminInvitationService($apiAdminClient);

interface Props {
    inv: AdminInvitationDto;
    onCancel: () => void;
}

export function InvitationNoteForm({ inv, onCancel }: Props) {
    const t = useTranslations();
    const { cancel, update, sync } = useInvitationListCache();

    const form = useForm<
        UpdateNoteAdminInvitationDtoInput,
        UpdateNoteAdminInvitationDtoOutput
    >({
        resolver: zodResolver(UpdateNoteAdminInvitationSchema),
        defaultValues: { note: inv.note ?? "" },
    });
    const {
        reset,
        formState: { isSubmitting, isDirty },
    } = form;

    useEffect(() => {
        reset({ note: inv.note ?? "" }, { keepDirty: false });
    }, [inv.note, reset]);

    const handleSubmit: CustomSubmitHandler<
        UpdateNoteAdminInvitationDtoInput,
        UpdateNoteAdminInvitationDtoOutput
    > = async (values, { setError }) => {
        try {
            await cancel();
            const { data: updated } = await service.updateNote(inv.id, values);
            update(() => updated, updated.id);
            sync();
            snackbarSuccess(t("pages.admin.invitation.feedback.noteUpdated"));
            onCancel();
        } catch (error) {
            errorFormHandler({ error, t, setError, formValues: values });
        }
    };

    return (
        <FormProvider form={form}>
            <Form<
                UpdateNoteAdminInvitationDtoInput,
                UpdateNoteAdminInvitationDtoOutput
            >
                form={form}
                onSubmit={handleSubmit}
            >
                <FormTextField<UpdateNoteAdminInvitationDtoInput>
                    name="note"
                    label="pages.admin.invitation.noteLabel"
                    size="small"
                    multiline
                    variant="outlined"
                    rows={2}
                    helperText={t("pages.admin.invitation.notePlaceholder")}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment
                                    position="end"
                                    sx={{ display: "flex", gap: 0.5 }}
                                >
                                    <StyledButton
                                        type="submit"
                                        size="small"
                                        variant="contained"
                                        loading={isSubmitting}
                                        disabled={!isDirty}
                                        sx={{
                                            height: "100%",
                                            minWidth: 0,
                                            px: 1,
                                        }}
                                    >
                                        <DoubleArrowIcon fontSize="small" />
                                    </StyledButton>
                                    <StyledButton
                                        type="button"
                                        size="small"
                                        variant="outlined"
                                        onClick={onCancel}
                                        disabled={isSubmitting}
                                        sx={{
                                            height: "100%",
                                            minWidth: 0,
                                            px: 1,
                                        }}
                                    >
                                        <CloseIcon fontSize="small" />
                                    </StyledButton>
                                </InputAdornment>
                            ),
                        },
                    }}
                />
            </Form>
        </FormProvider>
    );
}
