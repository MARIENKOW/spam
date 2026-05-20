// lib/query/hydrate.tsx
import { getQueryClient } from "@/lib/tanstack/queryClient";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

interface HydrateProps {
    children: React.ReactNode;
}

/**
 * Серверный компонент — сам берёт queryClient и деградирует.
 * Использование в page.tsx:
 *
 *   return <Hydrate><VideosList /></Hydrate>
 *
 * Вместо ручного dehydrate в каждой странице.
 */
export async function Hydrate({ children }: HydrateProps) {
    const queryClient = getQueryClient();
    const dehydratedState = dehydrate(queryClient);

    return (
        <HydrationBoundary state={dehydratedState}>
            {children}
        </HydrationBoundary>
    );
}
