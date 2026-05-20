import StarterKit from "@tiptap/starter-kit";
import Paragraph from "@tiptap/extension-paragraph";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Heading from "@tiptap/extension-heading";
import Blockquote from "@tiptap/extension-blockquote";
import CodeBlock from "@tiptap/extension-code-block";
import FontFamily from "@tiptap/extension-font-family";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Typography from "@tiptap/extension-typography";
import CharacterCount from "@tiptap/extension-character-count";
import { TextStyle } from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import type { Extensions } from "@tiptap/core";
import { Video } from "@/components/TextEditor/extensions/Video";
import { VideoUrl } from "@/components/TextEditor/extensions/VideoUrl";
import { Image } from "@/components/TextEditor/extensions/Image";
import { CustomLink } from "@/components/TextEditor/extensions/CustomLink";
import { FontSize } from "@/components/TextEditor/extensions/FontSize";
import { EmbedCode } from "@/components/TextEditor/extensions/EmbedCode";

// ─── Styled Extensions ────────────────────────────────────────────────────────

const WB = "word-break:break-word;overflow-wrap:break-word;";

const StyledParagraph = Paragraph.extend({
    renderHTML({ HTMLAttributes }) {
        return [
            "p",
            {
                ...HTMLAttributes,
                style: `font-size:1rem;font-weight:400;margin:0.25rem 0;${WB}${HTMLAttributes.style ?? ""}`,
            },
            0,
        ];
    },
});

const StyledBulletList = BulletList.extend({
    renderHTML({ HTMLAttributes }) {
        return [
            "ul",
            {
                ...HTMLAttributes,
                style: `list-style-type:disc;padding-left:1.5rem;margin:0.5rem 0;${WB}${HTMLAttributes.style ?? ""}`,
            },
            0,
        ];
    },
});

const StyledOrderedList = OrderedList.extend({
    renderHTML({ HTMLAttributes }) {
        return [
            "ol",
            {
                ...HTMLAttributes,
                style: `list-style-type:decimal;padding-left:1.5rem;margin:0.5rem 0;${WB}${HTMLAttributes.style ?? ""}`,
            },
            0,
        ];
    },
});

const StyledListItem = ListItem.extend({
    renderHTML({ HTMLAttributes }) {
        return [
            "li",
            {
                ...HTMLAttributes,
                style: `display:list-item;${WB}${HTMLAttributes.style ?? ""}`,
            },
            0,
        ];
    },
});

const HEADING_SIZES: Record<number, string> = {
    1: "2rem",
    2: "1.5rem",
    3: "1.25rem",
    4: "1.1rem",
    5: "0.875rem",
    6: "0.75rem",
};

const StyledHeading = Heading.extend({
    renderHTML({ node, HTMLAttributes }) {
        const level = node.attrs.level as number;
        return [
            `h${level}`,
            {
                ...HTMLAttributes,
                style: `font-size:${HEADING_SIZES[level] ?? "1rem"};font-weight:bold;margin:0.5rem 0;${WB}${HTMLAttributes.style ?? ""}`,
            },
            0,
        ];
    },
});

const StyledBlockquote = Blockquote.extend({
    renderHTML({ HTMLAttributes }) {
        return [
            "blockquote",
            {
                ...HTMLAttributes,
                style: `border-left:4px solid #ccc;padding-left:1rem;margin:0.5rem 0;color:#666;font-style:italic;${WB}${HTMLAttributes.style ?? ""}`,
            },
            0,
        ];
    },
});

const StyledCodeBlock = CodeBlock.extend({
    renderHTML({ HTMLAttributes }) {
        return [
            "pre",
            {
                ...HTMLAttributes,
                style: `background:#f4f4f4;padding:1rem;border-radius:4px;margin:0.5rem 0;overflow-x:auto;${WB}${HTMLAttributes.style ?? ""}`,
            },
            [
                "code",
                { style: `font-family:monospace;white-space:pre-wrap;${WB}` },
                0,
            ],
        ];
    },
});

// ─── Blog Extensions ──────────────────────────────────────────────────────────

export const blogExtensions: Extensions = [
    StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
        heading: false,
        blockquote: false,
        codeBlock: false,
        paragraph: false,
        link: false,
        underline: false,
    }),
    StyledParagraph,
    StyledBulletList,
    StyledOrderedList,
    StyledListItem,
    StyledHeading,
    StyledBlockquote,
    StyledCodeBlock,
    Video,
    VideoUrl,
    FontFamily,
    FontSize,
    Color,
    Highlight.configure({ multicolor: true }),
    Subscript,
    Superscript,
    Typography,
    CharacterCount,
    TextStyle,
    Underline,
    CustomLink.configure({
        openOnClick: false,
        autolink: true,
        protocols: ["http", "https", "mailto"],
    }),
    Image,
    EmbedCode,
    TextAlign.configure({ types: ["heading", "paragraph", "listItem"] }),
];
