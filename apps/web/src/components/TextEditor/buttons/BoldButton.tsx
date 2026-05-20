import FormatBoldIcon from "@mui/icons-material/FormatBold";
import { useTiptap, useTiptapState } from "@tiptap/react";
import { StyledIconButton } from "@/components/ui/StyledIconButton";

export default function BoldButton() {
    const { editor } = useTiptap();
    const isBold = useTiptapState((ctx) => ctx.editor.isActive("bold"));

    return (
        <StyledIconButton
            color={isBold ? "primary" : "default"}
            onClick={() => editor.chain().focus().toggleBold().run()}
        >
            <FormatBoldIcon />
        </StyledIconButton>
    );
}
