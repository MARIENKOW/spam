import Link from "@tiptap/extension-link";

export const CustomLink = Link.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            style: {
                default:
                    "color: #1d4ed8 !important; text-decoration: underline !important; font-weight: 500; cursor: pointer;",
            },
        };
    },

    renderHTML({ HTMLAttributes }) {
        return ["a", HTMLAttributes, 0];
    },
});
