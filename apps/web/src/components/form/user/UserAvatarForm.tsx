"use client";

import {
    AvatarUserInput,
    AvatarUserOutput,
    AvatarUserSchema,
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
import UserService from "@/services/user/user.service";
import { $apiUserClient } from "@/utils/api/user/fetch.user.client";
import { useUserAuth } from "@/components/wrappers/auth/UserAuthProvider";
import { UserDto } from "@myorg/shared/dto";
import { Box } from "@mui/material";

const { changeAvatar, deleteAvatar } = new UserService($apiUserClient);
export default function UserAvatarForm() {
    const t = useTranslations();
    const router = useRouter();
    const { user, setUser } = useUserAuth();
    const form = useForm<AvatarUserInput>({
        resolver: zodResolver(AvatarUserSchema),
    });

    const { control, handleSubmit } = form;

    const image = useWatch<AvatarUserInput>({
        name: "image",
        control,
    });

    const handleDelete = async () => {
        await deleteAvatar();
        setUser((u) => ({ ...u, avatar: null }) as UserDto);
        router.refresh();
    };
    const onSubmit: CustomSubmitHandler<AvatarUserOutput> = async (
        formValues,
        { setError },
    ) => {
        try {
            const { data } = await changeAvatar(formValues);
            setUser((u) => ({ ...u, avatar: data }) as UserDto);
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
        <FormProvider<AvatarUserInput> form={form}>
                <FormAvatarUpload<AvatarUserInput>
                    urlPreview={user?.avatar?.url}
                    isSubmitting={form.formState.isSubmitting}
                    onDelete={handleDelete}
                    sx={{ width: 150, height: 150 }}
                    name="image"
                />
        </FormProvider>
    );
}
