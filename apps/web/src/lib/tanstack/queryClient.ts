// lib/query/client.ts
import { cache } from "react";
import { QueryClient } from "@tanstack/react-query";

/**
 * React.cache гарантирует один инстанс на один серверный запрос.
 * Это значит prefetchQuery и dehydrate работают с одним и тем же
 * QueryClient — никаких расхождений данных.
 *
 * На клиенте это не вызывается — там работает Providers.
 */
export const getQueryClient = cache(
    () =>
        new QueryClient({
            defaultOptions: {
                queries: {
                    staleTime: 60 * 1000,
                    gcTime: 5 * 60 * 1000,
                    retry: 1,
                    refetchOnWindowFocus: false,
                },
            },
        }),
);
