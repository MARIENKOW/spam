import { useQuery } from "@tanstack/react-query";
import { blogKeys } from "@/lib/tanstack/keys";
import { BlogParams, defaultBlogParams } from "@/lib/tanstack/listDefaults";
import BlogService from "@/services/blog/blog.service";
import { $apiAdminClient } from "@/utils/api/admin/fetch.admin.client";

export { defaultBlogParams };

const { getAll } = new BlogService($apiAdminClient);

export function useBlogs(params: BlogParams) {
    return useQuery({
        queryKey: blogKeys.list(params),
        queryFn: () => getAll(params).then((r) => r.data),
        placeholderData: (prev) => prev,
    });
}
