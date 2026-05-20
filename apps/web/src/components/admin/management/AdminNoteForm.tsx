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
import { errorFormHandler } from "@/helpers/error/error.handler.helper";
import {
    UpdateNoteAdminManagementSchema,
    UpdateNoteAdminManagementDtoInput,
    UpdateNoteAdminManagementDtoOutput,
} from "@myorg/shared/form";
import { AdminManagementDto } from "@myorg/shared/dto";
import { useAdminListCache } from "@/hooks/tanstack/useAdminMutations";
import AdminManagementService from "@/services/admin/management/adminManagement.service";
import { $apiAdminClient } from "@/utils/api/admin/fetch.admin.client";
import { snackbarSuccess } from "@/utils/snackbar/snackbar.success";
import { useEffect } from "react";

const service = new AdminManagementService($apiAdminClient);

interface Props {
    admin: AdminManagementDto;
    onCancel: () => void;
}

export function AdminNoteForm({ admin, onCancel }: Props) {
    const t = useTranslations();
    const { cancel, update, sync } = useAdminListCache();

    const form = useForm<
        UpdateNoteAdminManagementDtoInput,
        UpdateNoteAdminManagementDtoOutput
    >({
        resolver: zodResolver(UpdateNoteAdminManagementSchema),
        defaultValues: { note: admin.note ?? "" },
    });
    const {
        reset,
        formState: { isSubmitting, isDirty },
    } = form;

    useEffect(() => {
        reset({ note: admin.note ?? "" }, { keepDirty: false });
    }, [admin.note, reset]);

    const handleSubmit: CustomSubmitHandler<
        UpdateNoteAdminManagementDtoInput,
        UpdateNoteAdminManagementDtoOutput
    > = async (values, { setError }) => {
        try {
            await cancel();
            const { data: updated } = await service.updateNote(admin.id, values);
            update(() => updated, updated.id);
            sync();
            snackbarSuccess(t("pages.admin.admins.feedback.noteUpdated"));
            onCancel();
        } catch (error) {
            errorFormHandler({ error, t, setError, formValues: values });
        }
    };

    return (
        <FormProvider form={form}>
            <Form<UpdateNoteAdminManagementDtoInput, UpdateNoteAdminManagementDtoOutput>
                form={form}
                onSubmit={handleSubmit}
            >
                <FormTextField<UpdateNoteAdminManagementDtoInput>
                    name="note"
                    label="pages.admin.admins.noteLabel"
                    size="small"
                    multiline
                    variant="outlined"
                    rows={2}
                    helperText={t("pages.admin.admins.notePlaceholder")}
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
                                        sx={{ height: "100%", minWidth: 0, px: 1 }}
                                    >
                                        <DoubleArrowIcon fontSize="small" />
                                    </StyledButton>
                                    <StyledButton
                                        type="button"
                                        size="small"
                                        variant="outlined"
                                        onClick={onCancel}
                                        disabled={isSubmitting}
                                        sx={{ height: "100%", minWidth: 0, px: 1 }}
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
