import { Node, mergeAttributes } from "@tiptap/core";
import {
    NodeViewWrapper,
    ReactNodeViewRenderer,
    NodeViewProps,
} from "@tiptap/react";
import { useResize } from "../hooks/useResize";
import { useTouchDrag } from "../hooks/useTouchDrag";
import NodeOverlayControls from "../components/NodeOverlayControls";

interface VideoAttrs {
    src: string;
    "data-id"?: string;
    poster?: string;
    width?: string;
    align?: "left" | "center" | "right";
}

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        video: {
            setVideo: (options: VideoAttrs) => ReturnType;
        };
    }
}

type Align = "left" | "center" | "right";

const JUSTIFY: Record<Align, string> = {
    left: "flex-start",
    center: "center",
    right: "flex-end",
};

const VideoComponent = ({
    node,
    editor,
    getPos,
    updateAttributes,
}: NodeViewProps) => {
    const align: Align = (node.attrs.align as Align) ?? "left";
    const { wrapperRef, onResizeStart } = useResize((width) =>
        updateAttributes({ width }),
    );
    const { isDragging, onTouchStart, onTouchMove, onTouchEnd } = useTouchDrag(
        getPos,
        () => node.nodeSize,
        editor,
    );

    const handleDelete = () => {
        editor
            .chain()
            .focus()
            .deleteRange({ from: getPos()!, to: getPos()! + node.nodeSize })
            .run();
    };

    return (
        <NodeViewWrapper
            style={{ display: "block", opacity: isDragging ? 0.4 : 1 }}
        >
            <div style={{ display: "flex", justifyContent: JUSTIFY[align] }}>
                <div
                    ref={wrapperRef}
                    style={{
                        position: "relative",
                        width: node.attrs.width ?? "auto",
                        display: "block",
                    }}
                >
                    <NodeOverlayControls
                        align={align}
                        onAlignChange={(a) => updateAttributes({ align: a })}
                        onDelete={handleDelete}
                        isDragging={isDragging}
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    />

                    <video
                        src={node.attrs.src}
                        data-id={node.attrs["data-id"]}
                        poster={node.attrs.poster}
                        controls
                        preload="none"
                        draggable={false}
                        style={{ width: "100%", display: "block" }}
                    />

                    {/* Resize handle */}
                    <div
                        onMouseDown={onResizeStart}
                        onTouchStart={onResizeStart}
                        style={{
                            position: "absolute",
                            bottom: 0,
                            right: 0,
                            width: 20,
                            height: 20,
                            background: "#1976d2",
                            borderRadius: "2px 0 0 0",
                            cursor: "nwse-resize",
                            touchAction: "none",
                            opacity: 0.8,
                        }}
                    />
                </div>
            </div>
        </NodeViewWrapper>
    );
};

export const Video = Node.create({
    name: "video",
    group: "block",
    atom: true,
    draggable: true,

    addAttributes() {
        return {
            src: { default: null },
            controls: { default: true },
            "data-id": { default: "" },
            width: { default: "auto" },
            poster: { default: "/default.png" },
            align: {
                default: "left",
                parseHTML: (el) => el.getAttribute("data-align") ?? "left",
                renderHTML: (attrs) => ({ "data-align": attrs.align }),
            },
        };
    },

    parseHTML() {
        return [{ tag: "video[data-id]" }];
    },

    renderHTML({ HTMLAttributes }) {
        const align: Align = (HTMLAttributes["data-align"] as Align) ?? "left";
        const justify = JUSTIFY[align];
        const width = (HTMLAttributes.width as string | null) ?? "auto";
        return [
            "div",
            { style: `display: flex; justify-content: ${justify};` },
            [
                "video",
                mergeAttributes(HTMLAttributes, {
                    style: `width: ${width}; max-width: 100%; display: block;`,
                }),
            ],
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(VideoComponent);
    },

    addCommands() {
        return {
            setVideo:
                (options: VideoAttrs) =>
                ({ commands }) =>
                    commands.insertContent({
                        type: this.name,
                        attrs: options,
                    }),
        };
    },
});
