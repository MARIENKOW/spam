import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import { useTiptap, useTiptapState } from "@tiptap/react";
import { StyledIconButton } from "@/components/ui/StyledIconButton";

export default function ItalicButton() {
    const { editor } = useTiptap();
    const isItalic = useTiptapState((ctx) => ctx.editor.isActive("italic"));

    return (
        <StyledIconButton
            color={isItalic ? "primary" : "default"}
            onClick={() => editor.chain().focus().toggleItalic().run()}
        >
            <FormatItalicIcon />
        </StyledIconButton>
    );
}
