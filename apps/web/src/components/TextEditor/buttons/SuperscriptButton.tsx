import { StyledIconButton } from "@/components/ui/StyledIconButton";
import { Box } from "@mui/material";
import { useTiptap, useTiptapState } from "@tiptap/react";

export default function SuperscriptButton() {
    const { editor } = useTiptap();
    const isSuperscript = useTiptapState((ctx) =>
        ctx.editor.isActive("superscript"),
    );

    return (
        <StyledIconButton
            color={isSuperscript ? "primary" : "default"}
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
        >
            <Box component="span" sx={{ fontSize: 14, fontWeight: 500 }}>
                x²
            </Box>
        </StyledIconButton>
    );
}
