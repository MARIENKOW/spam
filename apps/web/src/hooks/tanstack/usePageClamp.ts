import { useEffect } from "react";

/**
 * Корректирует страницу если она вышла за пределы pageCount.
 * Вызывать после entity-хука, когда data уже известна.
 */
export function usePageClamp(
    page: number,
    pageCount: number | undefined,
    setPage: (p: number) => void,
) {
    useEffect(() => {
        if (pageCount && page > pageCount) setPage(pageCount);
    }, [page, pageCount, setPage]);
}
