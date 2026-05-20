"use client";

import { blogKeys } from "@/lib/tanstack/keys";
import BlogService from "@/services/blog/blog.service";
import { $apiAdminClient } from "@/utils/api/admin/fetch.admin.client";
import { errorHandler } from "@/helpers/error/error.handler.helper";
import { snackbarSuccess } from "@/utils/snackbar/snackbar.success";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { BlogDto, PagedResult } from "@myorg/shared/dto";

const service = new BlogService($apiAdminClient);

type BlogList = PagedResult<BlogDto> | undefined;

export function useBlogListCache() {
    const queryClient = useQueryClient();

    function cancel() {
        return queryClient.cancelQueries({ queryKey: blogKeys.lists() });
    }

    function sync() {
        queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
    }

    function update(updater: (blog: BlogDto) => BlogDto, id: string) {
        queryClient.setQueriesData<BlogList>(
            { queryKey: blogKeys.lists() },
            (old) => {
                if (!old) return old;
                return {
                    ...old,
                    data: old.data.map((b) => (b.id === id ? updater(b) : b)),
                };
            },
        );
    }

    return { cancel, sync, update };
}

export function useSetMainBlog() {
    const t = useTranslations();
    const { cancel, sync } = useBlogListCache();

    return useMutation({
        mutationFn: (blogId: string) => service.setMain(blogId).then((r) => r.data),
        onMutate: () => cancel(),
        onSuccess: (updated) => {
            snackbarSuccess(
                t(updated.isMain
                    ? "pages.admin.blog.feedback.setMain"
                    : "pages.admin.blog.feedback.unsetMain",
                ),
            );
        },
        onError: (error) => errorHandler({ error, t }),
        onSettled: () => sync(),
    });
}

export function useToggleImportantBlog() {
    const t = useTranslations();
    const { cancel, update, sync } = useBlogListCache();

    return useMutation({
        mutationFn: (blogId: string) => service.setImportant(blogId).then((r) => r.data),
        onMutate: () => cancel(),
        onSuccess: (updated) => {
            update(() => updated, updated.id);
            snackbarSuccess(
                t(updated.isImportant
                    ? "pages.admin.blog.feedback.setImportant"
                    : "pages.admin.blog.feedback.unsetImportant",
                ),
            );
        },
        onError: (error) => errorHandler({ error, t }),
        onSettled: () => sync(),
    });
}

export function useToggleShortBlog() {
    const t = useTranslations();
    const { cancel, update, sync } = useBlogListCache();

    return useMutation({
        mutationFn: (blogId: string) => service.setShort(blogId).then((r) => r.data),
        onMutate: () => cancel(),
        onSuccess: (updated) => {
            update(() => updated, updated.id);
            snackbarSuccess(
                t(updated.isShort
                    ? "pages.admin.blog.feedback.setShort"
                    : "pages.admin.blog.feedback.unsetShort",
                ),
            );
        },
        onError: (error) => errorHandler({ error, t }),
        onSettled: () => sync(),
    });
}

export function useDeleteBlog() {
    const t = useTranslations();
    const { cancel, sync } = useBlogListCache();

    return useMutation({
        mutationFn: (blogId: string) => service.delete(blogId),
        onMutate: () => cancel(),
        onSuccess: () => {
            snackbarSuccess(t("pages.admin.blog.feedback.delete"));
        },
        onError: (error) => errorHandler({ error, t }),
        onSettled: () => sync(),
    });
}

export function useDeleteAllBlogs() {
    const t = useTranslations();
    const { cancel, sync } = useBlogListCache();

    return useMutation({
        mutationFn: () => service.deleteAll(),
        onMutate: () => cancel(),
        onSuccess: () => {
            snackbarSuccess(t("pages.admin.blog.feedback.deleteAll"));
        },
        onError: (error) => errorHandler({ error, t }),
        onSettled: () => sync(),
    });
}
