"use client";

import {
    AvatarAdminInput,
    AvatarAdminOutput,
    AvatarAdminSchema,
} from "@myorg/shared/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { errorFormHandler } from "@/helpers/error/error.handler.helper";
import { useTranslations } from "next-intl";
import { CustomSubmitHandler } from "@/components/wrappers/form/Form";

import useForm from "@/hooks/useForm";
import FormProvider from "@/components/wrappers/form/FormProvider";
import { useEffect } from "react";
import { useWatch } from "react-hook-form";

import { useRouter } from "@/i18n/navigation";

import FormAvatarUpload from "@/components/features/form/fields/controlled/FormAvatarUpload/FormAvatarUpload";
import AdminService from "@/services/admin/admin.service";
import { $apiAdminClient } from "@/utils/api/admin/fetch.admin.client";
import { useAdminAuth } from "@/components/wrappers/auth/AdminAuthProvider";
import { AdminDto } from "@myorg/shared/dto";
import { Box } from "@mui/material";

const { changeAvatar, deleteAvatar } = new AdminService($apiAdminClient);
export default function AdminAvatarForm() {
    const t = useTranslations();
    const router = useRouter();
    const { admin, setAdmin } = useAdminAuth();
    const form = useForm<AvatarAdminInput>({
        resolver: zodResolver(AvatarAdminSchema),
    });

    const { control, handleSubmit } = form;

    const image = useWatch<AvatarAdminInput>({
        name: "image",
        control,
    });

    const handleDelete = async () => {
        await deleteAvatar();
        setAdmin((u) => ({ ...u, avatar: null }) as AdminDto);
        router.refresh();
    };
    const onSubmit: CustomSubmitHandler<AvatarAdminOutput> = async (
        formValues,
        { setError },
    ) => {
        try {
            const { data } = await changeAvatar(formValues);
            setAdmin((u) => ({ ...u, avatar: data }) as AdminDto);
            router.refresh();
        } catch (error) {
            errorFormHandler({ error, setError, t, formValues });
        }
    };
    useEffect(() => {
        if (!image) return;

        const submitFn = form.handleSubmit((data, event) =>
            onSubmit(data, form, event),
        );
        submitFn();
    }, [image, handleSubmit]);

    return (
        <FormProvider<AvatarAdminInput> form={form}>
            <FormAvatarUpload<AvatarAdminInput>
                urlPreview={admin?.avatar?.url}
                isSubmitting={form.formState.isSubmitting}
                onDelete={handleDelete}
                sx={{ width: 150, height: 150 }}
                name="image"
            />
        </FormProvider>
    );
}
