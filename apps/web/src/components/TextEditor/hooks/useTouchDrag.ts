import { useRef, useState } from "react";
import type { Editor } from "@tiptap/core";

/**
 * Touch drag-and-drop for Tiptap atom nodes.
 * HTML5 DnD API doesn't fire on mobile, so we implement it manually.
 * Drop indicator is rendered as a direct DOM element (no React re-renders on move).
 */
export function useTouchDrag(
    getPos: () => number | undefined,
    getNodeSize: () => number,
    editor: Editor,
) {
    const [isDragging, setIsDragging] = useState(false);
    const originRef = useRef<{ y: number } | null>(null);
    const didDragRef = useRef(false);
    const indicatorRef = useRef<HTMLDivElement | null>(null);
    const DRAG_THRESHOLD = 8;

    const showIndicator = (x: number, y: number) => {
        if (!indicatorRef.current) {
            const el = document.createElement("div");
            el.style.cssText =
                "position:fixed;height:2px;background:#1976d2;pointer-events:none;z-index:9999;border-radius:1px;";
            document.body.appendChild(el);
            indicatorRef.current = el;
        }
        const editorRect = editor.view.dom.getBoundingClientRect();
        const el = indicatorRef.current;
        el.style.left = `${editorRect.left}px`;
        el.style.width = `${editorRect.width}px`;
        el.style.top = `${y}px`;
    };

    const hideIndicator = () => {
        indicatorRef.current?.remove();
        indicatorRef.current = null;
    };

    const onTouchStart = (e: React.TouchEvent) => {
        originRef.current = { y: e.touches[0].clientY };
        didDragRef.current = false;
    };

    const onTouchMove = (e: React.TouchEvent) => {
        if (!originRef.current) return;
        const touch = e.touches[0];
        const dy = Math.abs(touch.clientY - originRef.current.y);
        if (!didDragRef.current && dy > DRAG_THRESHOLD) {
            didDragRef.current = true;
            setIsDragging(true);
        }
        if (didDragRef.current) {
            e.preventDefault();
            showIndicator(touch.clientX, touch.clientY);
        }
    };

    const onTouchEnd = (e: React.TouchEvent) => {
        hideIndicator();

        if (!didDragRef.current) {
            originRef.current = null;
            setIsDragging(false);
            return;
        }

        const touch = e.changedTouches[0];
        const editorDom = editor.view.dom;
        const editorRect = editorDom.getBoundingClientRect();

        const clampedLeft = Math.min(Math.max(touch.clientX, editorRect.left + 1), editorRect.right - 1);
        const clampedTop = Math.min(Math.max(touch.clientY, editorRect.top + 1), editorRect.bottom - 1);

        const resolved = editor.view.posAtCoords({ left: clampedLeft, top: clampedTop });
        const from = getPos();

        // Reset BEFORE dispatch — otherwise the old node re-renders with opacity:0.4
        originRef.current = null;
        didDragRef.current = false;
        setIsDragging(false);

        if (resolved && from !== undefined) {
            const nodeSize = getNodeSize();
            const to = from + nodeSize;
            const node = editor.state.doc.nodeAt(from);
            if (node) {
                let insertAt = resolved.pos;
                if (insertAt >= to) insertAt -= nodeSize;
                if (insertAt !== from) {
                    const tr = editor.state.tr.delete(from, to).insert(insertAt, node);
                    editor.view.dispatch(tr);
                }
            }
        }
    };

    return { isDragging, onTouchStart, onTouchMove, onTouchEnd };
}
