import { useRef } from "react";

export function useResize(onWidth: (width: string) => void) {
    const wrapperRef = useRef<HTMLDivElement>(null);

    const onResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const startX = "touches" in e ? e.touches[0].clientX : e.clientX;
        const startWidth = wrapperRef.current?.offsetWidth ?? 300;

        const onMove = (clientX: number) => {
            const newWidth = Math.max(80, startWidth + (clientX - startX));
            onWidth(`${newWidth}px`);
        };

        const onMouseMove = (e: MouseEvent) => onMove(e.clientX);
        const onTouchMove = (e: TouchEvent) => {
            e.preventDefault();
            onMove(e.touches[0].clientX);
        };

        const cleanup = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", cleanup);
            document.removeEventListener("touchmove", onTouchMove);
            document.removeEventListener("touchend", cleanup);
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", cleanup);
        document.addEventListener("touchmove", onTouchMove, { passive: false });
        document.addEventListener("touchend", cleanup);
    };

    return { wrapperRef, onResizeStart };
}
