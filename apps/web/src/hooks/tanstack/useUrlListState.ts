"use client";

import { useCallback, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ListState } from "@/hooks/tanstack/listState";
import { Pagination } from "@/lib/tanstack/pagination";
import { parseListParams } from "@/lib/tanstack/parseListParams";

export function useUrlListState<F extends Record<string, unknown>>(
    defaults: Pagination & F,
): ListState<F> {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const defaultRef = useRef(defaults);

    const { page, ...filtersRest } = useMemo(() => {
        const params: Record<string, string | undefined> = {};
        searchParams.forEach((value, key) => {
            params[key] = value;
        });
        return parseListParams(params, defaultRef.current);
    }, [searchParams]);

    const filters = filtersRest as unknown as F;

    const buildUrl = useCallback(
        (newFilters: F, newPage: Pagination["page"]): string => {
            const params = new URLSearchParams(searchParams.toString());

            for (const k of Object.keys(newFilters) as (keyof F & string)[]) {
                const value = newFilters[k];
                const isDefault =
                    value === defaultRef.current[k] ||
                    value === "" ||
                    value === null ||
                    value === undefined;
                if (isDefault) {
                    params.delete(k);
                } else {
                    params.set(k, String(value));
                }
            }

            if (newPage <= 1) {
                params.delete("page");
            } else {
                params.set("page", String(newPage));
            }

            const qs = params.toString();
            return `${pathname}${qs ? `?${qs}` : ""}`;
        },
        [searchParams, pathname],
    );

    const setFilter = useCallback(
        <K extends keyof F>(k: K, value: F[K]) => {
            router.replace(buildUrl({ ...filters, [k]: value }, defaultRef.current.page), {
                scroll: false,
            });
        },
        [filters, buildUrl, router],
    );

    const resetFilters = useCallback(() => {
        const { page: defaultPage, ...defaultFiltersRest } = defaultRef.current;
        router.replace(buildUrl(defaultFiltersRest as unknown as F, defaultPage), { scroll: false });
    }, [buildUrl, router]);

    const setPage = useCallback(
        (p: Pagination["page"]) => {
            router.replace(buildUrl(filters, p), { scroll: false });
        },
        [filters, buildUrl, router],
    );

    return { filters, setFilter, resetFilters, page, setPage };
}
