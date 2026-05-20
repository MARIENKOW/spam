import { Node } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer, NodeViewProps } from "@tiptap/react";
import NodeOverlayControls from "../components/NodeOverlayControls";
import { useTouchDrag } from "../hooks/useTouchDrag";

interface EmbedCodeAttrs {
    code: string;
    align?: "left" | "center" | "right";
}

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        embedCode: {
            setEmbedCode: (options: EmbedCodeAttrs) => ReturnType;
        };
    }
}

type Align = "left" | "center" | "right";

const JUSTIFY: Record<Align, string> = {
    left: "flex-start",
    center: "center",
    right: "flex-end",
};

const EmbedCodeComponent = ({ node, editor, getPos, updateAttributes }: NodeViewProps) => {
    const align: Align = (node.attrs.align as Align) ?? "left";
    const code = node.attrs.code as string;

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
        <NodeViewWrapper style={{ display: "block", opacity: isDragging ? 0.4 : 1 }}>
            <div style={{ display: "flex", justifyContent: JUSTIFY[align] }}>
                <div style={{ position: "relative", width: "auto", maxWidth: "100%" }}>
                    <NodeOverlayControls
                        align={align}
                        onAlignChange={(a) => updateAttributes({ align: a })}
                        onDelete={handleDelete}
                        isDragging={isDragging}
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    />
                    <div
                        // eslint-disable-next-line react/no-danger
                        dangerouslySetInnerHTML={{ __html: code }}
                        style={{ width: "auto", display: "inline-block" }}
                    />
                </div>
            </div>
        </NodeViewWrapper>
    );
};

export const EmbedCode = Node.create({
    name: "embedCode",
    group: "block",
    atom: true,
    draggable: true,

    addAttributes() {
        return {
            code: {
                default: "",
                parseHTML: (el) => decodeURIComponent(el.getAttribute("data-embed-code") ?? ""),
            },
            align: {
                default: "left",
                parseHTML: (el) => el.getAttribute("data-align") ?? "left",
                renderHTML: (attrs) => ({ "data-align": attrs.align }),
            },
        };
    },

    parseHTML() {
        return [
            { tag: "div[data-embed-code]" },
            // backward compat: old format had data-embed-code on the inner element (iframe, etc.)
            { tag: "[data-embed-code]:not(div)" },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        const code = (HTMLAttributes.code as string) ?? "";
        const align: Align = (HTMLAttributes["data-align"] as Align) ?? "left";
        const justify = JUSTIFY[align];

        const wrapperAttrs = {
            "data-embed-code": encodeURIComponent(code),
            "data-align": align,
            style: `display: flex; justify-content: ${justify};`,
        };

        if (typeof document !== "undefined" && code) {
            const tmp = document.createElement("div");
            tmp.innerHTML = code.trim();
            const el = tmp.firstElementChild as HTMLElement | null;
            if (el) {
                el.style.maxWidth = "100%";
                return ["div", wrapperAttrs, el];
            }
        }

        return ["div", wrapperAttrs];
    },

    addNodeView() {
        return ReactNodeViewRenderer(EmbedCodeComponent);
    },

    addCommands() {
        return {
            setEmbedCode:
                (options: EmbedCodeAttrs) =>
                ({ commands }) =>
                    commands.insertContent({
                        type: this.name,
                        attrs: options,
                    }),
        };
    },
});
