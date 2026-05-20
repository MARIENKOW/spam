import { StyledIconButton } from "@/components/ui/StyledIconButton";
import { Box } from "@mui/material";
import { useTiptap, useTiptapState } from "@tiptap/react";

export default function SubscriptButton() {
    const { editor } = useTiptap();
    const isSubscript = useTiptapState((ctx) =>
        ctx.editor.isActive("subscript"),
    );

    return (
        <StyledIconButton
            color={isSubscript ? "primary" : "default"}
            onClick={() => editor.chain().focus().toggleSubscript().run()}
        >
            <Box component="span" sx={{ fontSize: 14, fontWeight: 500 }}>
                x₂
            </Box>
        </StyledIconButton>
    );
}
