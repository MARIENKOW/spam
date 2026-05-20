"use client";

import { StyledButton } from "@/components/ui/StyledButton";
import { errorHandler } from "@/helpers/error/error.handler.helper";
import { useConfirm } from "@/hooks/useConfirm";
import { imageKeys } from "@/lib/tanstack/keys";
import BlogImageService from "@/services/blog/image/blogImage.service";
import { snackbarSuccess } from "@/utils/snackbar/snackbar.success";
import { Card, CardHeader } from "@mui/material";
import { ImageDto } from "@myorg/shared/dto";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useImageSelect } from "@/components/TextEditor/components/image/ImageSelectContext";
import { $apiAdminAxiosClient } from "@/utils/api/admin/axios.admin.client";

const imageS = new BlogImageService($apiAdminAxiosClient);

export const ImageControl = ({ image }: { image: ImageDto }) => {
    const [loadingDelete, setLoadingDelete] = useState(false);
    const { confirm, confirmDialog } = useConfirm();
    const t = useTranslations();
    const queryClient = useQueryClient();
    const { onSelect } = useImageSelect();

    const handleAdd = () => {
        onSelect?.(image);
    };

    const handleDelete = async () => {
        try {
            const isConfirm = await confirm({
                title: t("image.control.deleteConfirm"),
            });
            if (!isConfirm) return;
            setLoadingDelete(true);
            await imageS.delete(image.id);
            queryClient.invalidateQueries({ queryKey: imageKeys.lists() });
            snackbarSuccess(
                t("pages.admin.blog.feedback.mediaImage.deleteSuccess"),
            );
        } catch (error) {
            errorHandler({ error, t });
        } finally {
            setLoadingDelete(false);
        }
    };

    return (
        <Card>
            {confirmDialog}
            <CardHeader
                sx={{
                    bgcolor: "background.default",
                    pl: "6px !important",
                    pr: "6px !important",
                    pt: "3px !important",
                    pb: "3px !important",
                    "& .MuiCardHeader-action": {
                        marginTop: "0px !important",
                        marginRight: "0px !important",
                        marginLeft: "0px !important",
                        marginBottom: "0px !important",
                    },
                }}
                avatar={
                    <StyledButton onClick={handleAdd} size="small">
                        {t("image.control.add")}
                    </StyledButton>
                }
                action={
                    <StyledButton
                        loading={loadingDelete}
                        size="small"
                        color="error"
                        onClick={handleDelete}
                    >
                        {t("image.control.delete")}
                    </StyledButton>
                }
            />
            <img
                src={image.url}
                alt=""
                style={{
                    width: "100%",
                    aspectRatio: "5/3",
                    objectFit: "contain",
                    display: "block",
                }}
            />
        </Card>
    );
};
