import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import { useTiptap, useTiptapState } from "@tiptap/react";
import { StyledIconButton } from "@/components/ui/StyledIconButton";

export default function BulletListButton() {
    const { editor } = useTiptap();
    const isBulletList = useTiptapState((ctx) =>
        ctx.editor.isActive("bulletList"),
    );

    return (
        <StyledIconButton
            color={isBulletList ? "primary" : "default"}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
            <FormatListBulletedIcon />
        </StyledIconButton>
    );
}
