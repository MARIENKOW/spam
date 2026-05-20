"use client";

import { StyledButton } from "@/components/ui/StyledButton";
import { errorHandler } from "@/helpers/error/error.handler.helper";
import { useConfirm } from "@/hooks/useConfirm";
import { videoKeys } from "@/lib/tanstack/keys";
import BlogVideoService from "@/services/blog/video/blogVideo.service";
import { $apiAdminAxiosClient } from "@/utils/api/admin/axios.admin.client";
import { snackbarInfo } from "@/utils/snackbar/snackbar.info";
import { snackbarSuccess } from "@/utils/snackbar/snackbar.success";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";

const { deleteAll } = new BlogVideoService($apiAdminAxiosClient);

export default function DeleteAllVideoBlog() {
    const [loading, setLoading] = useState<boolean>(false);
    const { confirm, confirmDialog } = useConfirm();
    const t = useTranslations();
    const queryClient = useQueryClient();
    const handleDeleteAll = async () => {
        setLoading(true);
        try {
            const isConfirm = await confirm({
                title: t("video.control.deleteAllConfirm"),
            });
            if (!isConfirm) return;
            const { data } = await deleteAll();
            queryClient.invalidateQueries({ queryKey: videoKeys.lists() });
            if (data.skipped > 0) {
                snackbarInfo(
                    t("pages.admin.blog.feedback.mediaVideo.deleteAllSkipped", {
                        count: data.skipped,
                    }),
                );
            } else {
                snackbarSuccess(
                    t("pages.admin.blog.feedback.mediaVideo.deleteAllSuccess"),
                );
            }
        } catch (error) {
            errorHandler({ error, t });
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            {confirmDialog}
            <StyledButton
                variant="outlined"
                color="error"
                loading={loading}
                onClick={handleDeleteAll}
            >
                {t("video.control.deleteAll")}
            </StyledButton>
        </>
    );
}
