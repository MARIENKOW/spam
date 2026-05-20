import FormatStrikethroughIcon from "@mui/icons-material/FormatStrikethrough";
import { useTiptap, useTiptapState } from "@tiptap/react";
import { StyledIconButton } from "@/components/ui/StyledIconButton";

export default function StrikeButton() {
    const { editor } = useTiptap();
    const isStrike = useTiptapState((ctx) => ctx.editor.isActive("strike"));

    return (
        <StyledIconButton
            color={isStrike ? "primary" : "default"}
            onClick={() => editor.chain().focus().toggleStrike().run()}
        >
            <FormatStrikethroughIcon />
        </StyledIconButton>
    );
}
