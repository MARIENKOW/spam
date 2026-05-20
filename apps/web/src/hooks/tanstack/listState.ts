import { useCallback, useRef, useState } from "react";
import { Pagination } from "@/lib/tanstack/pagination";

/**
 * Контракт стейта для списков с фильтрацией и пагинацией.
 * Реализован двумя хуками: useLocalListState (useState) и useUrlListState (URL).
 * Entity-хуки не знают об источнике стейта — получают params напрямую.
 */
export type ListState<F> = {
    page: Pagination["page"];
    setPage: (page: Pagination["page"]) => void;
    filters: F;
    setFilter: <K extends keyof F>(key: K, value: F[K]) => void;
    resetFilters: () => void;
};

/**
 * Локальный стейт — фильтры и страница хранятся в useState.
 * Смена любого фильтра автоматически сбрасывает страницу на 1.
 *
 * defaults должен быть стабильной ссылкой (module-level константа).
 */
export function useLocalListState<F extends Record<string, unknown>>(
    defaults: Pagination & F,
): ListState<F> {
    const defaultRef = useRef(defaults);
    const { page: defaultPage, ...defaultFiltersRest } = defaults;
    const defaultFilters = defaultFiltersRest as unknown as F;

    const [filters, setFilters] = useState<F>(defaultFilters);
    const [page, setPageRaw] = useState<Pagination["page"]>(defaultPage);

    const setFilter = useCallback(<K extends keyof F>(key: K, value: F[K]) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setPageRaw(defaultRef.current.page);
    }, []);

    const resetFilters = useCallback(() => {
        const { page: p, ...rest } = defaultRef.current;
        setFilters(rest as unknown as F);
        setPageRaw(p);
    }, []);

    const setPage = useCallback((p: Pagination["page"]) => {
        setPageRaw(p);
    }, []);

    return { filters, setFilter, resetFilters, page, setPage };
}
