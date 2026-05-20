"use client";

import { StyledButton } from "@/components/ui/StyledButton";
import { useConfirm } from "@/hooks/useConfirm";
import { useDeleteAllBlogs } from "@/hooks/tanstack/useBlogMutations";
import { useTranslations } from "next-intl";

export default function DeleteAllBlogs() {
    const t = useTranslations();
    const { confirm, confirmDialog } = useConfirm();
    const { mutate, isPending } = useDeleteAllBlogs();

    const handle = async () => {
        const ok = await confirm();
        if (!ok) return;
        mutate();
    };

    return (
        <>
            {confirmDialog}
            <StyledButton
                fullWidth
                color="error"
                variant="outlined"
                onClick={handle}
                loading={isPending}
            >
                {t("common.deleteAll")}
            </StyledButton>
        </>
    );
}
