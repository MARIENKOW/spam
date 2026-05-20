"use client";

import BlogForm from "@/components/form/BlogForm";
import { useRouter } from "@/i18n/navigation";
import { blogKeys } from "@/lib/tanstack/keys";
import BlogService from "@/services/blog/blog.service";
import { $apiAdminClient } from "@/utils/api/admin/fetch.admin.client";
import { snackbarSuccess } from "@/utils/snackbar/snackbar.success";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

const { create } = new BlogService($apiAdminClient);

export default function BlogCreateForm() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const t = useTranslations();
    return (
        <BlogForm
            onRequest={async (value) => {
                await create(value);
                snackbarSuccess(t("pages.admin.blog.feedback.create"));
                queryClient.invalidateQueries({ queryKey: blogKeys.all });
                router.push(FULL_PATH_ROUTE.admin.blog.path);
            }}
        />
    );
}
