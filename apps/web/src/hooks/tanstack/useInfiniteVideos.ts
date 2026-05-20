import BlogVideoService from "@/services/blog/video/blogVideo.service";
import { $apiUserAxiosClient } from "@/utils/api/user/axios.user.client";
import { videoKeys } from "@/lib/tanstack/keys";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const { getAll } = new BlogVideoService($apiUserAxiosClient);

export function useInfiniteVideos() {
    const [startPage, setStartPage] = useState(1);
    const queryClient = useQueryClient();

    const queryKey = [...videoKeys.lists(), { startPage }];

    const query = useInfiniteQuery({
        queryKey,
        queryFn: ({ pageParam }) =>
            getAll({ page: pageParam as number }).then((r) => r.data),
        initialPageParam: startPage,
        getNextPageParam: (lastPage) => {
            const { page, pageCount } = lastPage.meta;
            return page < pageCount ? page + 1 : undefined;
        },
    });

    const items = query.data?.pages.flatMap((p) => p.data) ?? [];
    const meta = query.data?.pages.at(-1)?.meta;

    const goToPage = (page: number) => {
        // Чистим кеш текущего запроса чтобы при возврате не получить
        // закешированный результат с накопленными страницами
        queryClient.removeQueries({ queryKey });
        setStartPage(page);
    };

    return { ...query, items, meta, goToPage };
}
