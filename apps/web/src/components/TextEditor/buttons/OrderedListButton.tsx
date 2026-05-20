import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import { useTiptap, useTiptapState } from "@tiptap/react";
import { StyledIconButton } from "@/components/ui/StyledIconButton";

export default function OrderedListButton() {
    const { editor } = useTiptap();
    const isOrderedList = useTiptapState((ctx) =>
        ctx.editor.isActive("orderedList"),
    );

    return (
        <StyledIconButton
            color={isOrderedList ? "primary" : "default"}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
            <FormatListNumberedIcon />
        </StyledIconButton>
    );
}
