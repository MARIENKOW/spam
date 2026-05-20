// app/providers.tsx
"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // staleTime: 60 * 1000,
                // gcTime: 5 * 60 * 1000,
                retry: 1,
                refetchOnWindowFocus: true,
            },
        },
    });
}

/**
 * useState гарантирует: один QueryClient на всё время жизни компонента.
 * Не используем переменную вне компонента — это вызовет проблемы
 * при серверном рендере (shared state между запросами).
 */
export function TanstackProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(makeQueryClient);

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {process.env.NODE_ENV === "development" && <ReactQueryDevtools />}
        </QueryClientProvider>
    );
}
