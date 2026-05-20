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
    UpdateNoteUserManagementSchema,
    UpdateNoteUserManagementDtoInput,
    UpdateNoteUserManagementDtoOutput,
} from "@myorg/shared/form";
import { UserManagementDto } from "@myorg/shared/dto";
import { useUserListCache } from "@/hooks/tanstack/useUserMutations";
import UserManagementService from "@/services/admin/userManagement/userManagement.service";
import { $apiAdminClient } from "@/utils/api/admin/fetch.admin.client";
import { snackbarSuccess } from "@/utils/snackbar/snackbar.success";
import { useEffect } from "react";

const service = new UserManagementService($apiAdminClient);

interface Props {
    user: UserManagementDto;
    onCancel: () => void;
}

export function UserNoteForm({ user, onCancel }: Props) {
    const t = useTranslations();
    const { cancel, update, sync } = useUserListCache();

    const form = useForm<UpdateNoteUserManagementDtoInput, UpdateNoteUserManagementDtoOutput>({
        resolver: zodResolver(UpdateNoteUserManagementSchema),
        defaultValues: { note: user.note ?? "" },
    });
    const { reset, formState: { isSubmitting, isDirty } } = form;

    useEffect(() => {
        reset({ note: user.note ?? "" }, { keepDirty: false });
    }, [user.note, reset]);

    const handleSubmit: CustomSubmitHandler<UpdateNoteUserManagementDtoInput, UpdateNoteUserManagementDtoOutput> = async (
        values,
        { setError },
    ) => {
        try {
            await cancel();
            const { data: updated } = await service.updateNote(user.id, values);
            update(() => updated, updated.id);
            sync();
            snackbarSuccess(t("pages.admin.users.feedback.noteUpdated"));
            onCancel();
        } catch (error) {
            errorFormHandler({ error, t, setError, formValues: values });
        }
    };

    return (
        <FormProvider form={form}>
            <Form<UpdateNoteUserManagementDtoInput, UpdateNoteUserManagementDtoOutput> form={form} onSubmit={handleSubmit}>
                <FormTextField<UpdateNoteUserManagementDtoInput>
                    name="note"
                    label="pages.admin.users.noteLabel"
                    size="small"
                    multiline
                    variant="outlined"
                    rows={2}
                    helperText={t("pages.admin.users.notePlaceholder")}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position="end" sx={{ display: "flex", gap: 0.5 }}>
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
