"use client";

import Grid from "@mui/material/Grid";

import { useEffect, useState } from "react";
import FormProvider from "@/components/wrappers/form/FormProvider";
import Form, { CustomSubmitHandler } from "@/components/wrappers/form/Form";
import { FormConfigProvider } from "@/components/wrappers/form/FormConfigProvider";
import SubmitButton from "@/components/features/form/SubmitButton";
import FormTextField from "@/components/features/form/fields/controlled/FormTextField";
import FormDropZone from "@/components/features/form/fields/controlled/FormDropZone";
import useForm from "@/hooks/useForm";
import FormAlert from "@/components/features/form/FormAlert";
import { errorFormHandlerWithAlert } from "@/helpers/error/error.handler.helper";
import { useTranslations } from "next-intl";
import FormBlogEditor from "@/components/features/form/fields/controlled/FormBlogEditor";
import { useWatch } from "react-hook-form";
import ImagePreview from "@/components/common/ImagePreview";
import {
    BlogInput,
    BlogOutput,
    BlogSchema,
    BLOG_IMAGE_CONFIG,
} from "@myorg/shared/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box } from "@mui/material";
import { BlogDto } from "@myorg/shared/dto";
import FormDateTimePicker from "@/components/features/form/fields/controlled/FormDateTimePicker";

const BlogForm = ({
    onRequest,
    initData,
}: {
    initData?: BlogDto;
    onRequest: (data: BlogOutput) => Promise<void>;
}) => {
    const t = useTranslations();
    const [preview, setPreview] = useState<string | null>(
        initData?.image.url || null,
    );

    const form = useForm<BlogInput, BlogOutput>({
        resolver: zodResolver(BlogSchema),
        defaultValues: {
            image: initData?.image.url || null,
            title: initData?.title || "",
            subtitle: initData?.subtitle || "",
            body: initData?.body || "",
            publishedAt: null,
            videosId: initData?.bodyVideosId || [],
            imagesId: initData?.bodyImagesId || [],
        },
    });

    const { control, setValue } = form;
    useEffect(() => {
        setValue(
            "publishedAt",
            initData?.publishedAt ? new Date(initData.publishedAt) : new Date(),
        );
    }, [setValue]);

    const image = useWatch<BlogInput>({
        name: "image",
        control,
    }) as BlogInput["image"];

    useEffect(() => {
        if (!image) return setPreview(null);
        if (typeof image === "string") return setPreview(image);
        const isSuccess = BlogSchema.shape.image.safeParse(image).success;
        if (!isSuccess) return setPreview(null);
        const url = URL.createObjectURL(image);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [image]);

    const handleSubmit: CustomSubmitHandler<BlogInput, BlogOutput> = async (
        formValues,
        { setError },
    ) => {
        try {
            await onRequest(formValues);
        } catch (error) {
            errorFormHandlerWithAlert({ error, t, formValues, setError });
        }
    };

    return (
        <FormConfigProvider
            value={{
                fields: { variant: "outlined" },
                submit: { variant: "contained", text: "form.submit" },
            }}
        >
            <FormProvider form={form}>
                <Form<BlogInput, BlogOutput>
                    onSubmit={handleSubmit}
                    form={form}
                >
                    <Box flex={1} display="flex" flexDirection="column" gap={2}>
                        <Grid container spacing={{ xs: 3, md: 2 }} columns={10}>
                            <Grid
                                sx={{
                                    aspectRatio: "16 / 6",
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                                size={{ xs: 10, md: 5 }}
                            >
                                {preview && (
                                    <ImagePreview
                                        src={preview}
                                        onDelete={() =>
                                            form.setValue("image", null)
                                        }
                                    />
                                )}
                                {!preview && (
                                    <FormDropZone
                                        accept={
                                            BLOG_IMAGE_CONFIG.allowedMimeTypes
                                        }
                                        name="image"
                                    />
                                )}
                            </Grid>
                            <Grid
                                display="flex"
                                flexDirection="column"
                                gap={2}
                                size={{ xs: 10, md: 5 }}
                            >
                                <FormTextField<BlogInput>
                                    name="title"
                                    label="form.blog.title.label"
                                />
                                <FormTextField<BlogInput>
                                    name="subtitle"
                                    helperText={t("form.optional")}
                                    label="form.blog.subtitle.label"
                                />
                                <FormDateTimePicker<BlogInput> name="publishedAt" />
                            </Grid>
                        </Grid>
                        <Box
                            flex={1}
                            minHeight={270}
                            display="flex"
                            flexDirection="column"
                        >
                            <FormBlogEditor<BlogInput>
                                name="body"
                                onImagesChange={(images) =>
                                    form.setValue("imagesId", images)
                                }
                                onVideosChange={(videos) =>
                                    form.setValue("videosId", videos)
                                }
                            />
                        </Box>
                    </Box>
                    <FormAlert />
                    <SubmitButton  />
                </Form>
            </FormProvider>
        </FormConfigProvider>
    );
};

export default BlogForm;
