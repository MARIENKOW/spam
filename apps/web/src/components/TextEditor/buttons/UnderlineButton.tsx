import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import { useTiptap, useTiptapState } from "@tiptap/react";
import { StyledIconButton } from "@/components/ui/StyledIconButton";

export default function UnderlineButton() {
    const { editor } = useTiptap();
    const isUnderline = useTiptapState((ctx) =>
        ctx.editor.isActive("underline"),
    );

    return (
        <StyledIconButton
            color={isUnderline ? "primary" : "default"}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
            <FormatUnderlinedIcon />
        </StyledIconButton>
    );
}
