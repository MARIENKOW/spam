import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { videoKeys } from "@/lib/tanstack/keys";
import { VideoParams, defaultVideoParams } from "@/lib/tanstack/listDefaults";
import BlogVideoService from "@/services/blog/video/blogVideo.service";
import { $apiAdminAxiosClient } from "@/utils/api/admin/axios.admin.client";

export { defaultVideoParams };

const { getAll } = new BlogVideoService($apiAdminAxiosClient);

export function useVideos(params: VideoParams) {
    return useQuery({
        queryKey: videoKeys.list(params),
        queryFn: () => getAll(params).then((r) => r.data),
        placeholderData: (prev) => prev,
    });
}
