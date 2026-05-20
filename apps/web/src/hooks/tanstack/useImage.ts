import { useQuery } from "@tanstack/react-query";
import { imageKeys } from "@/lib/tanstack/keys";
import { ImageParams, defaultImageParams } from "@/lib/tanstack/listDefaults";
import BlogImageService from "@/services/blog/image/blogImage.service";
import { $apiAdminAxiosClient } from "@/utils/api/admin/axios.admin.client";

export { defaultImageParams };

const { getAll } = new BlogImageService($apiAdminAxiosClient);

export function useImages(params: ImageParams) {
    return useQuery({
        queryKey: imageKeys.list(params),
        queryFn: () => getAll(params).then((r) => r.data),
        placeholderData: (prev) => prev,
    });
}
