import { IconButton } from "@mui/material";
import FormatClearIcon from "@mui/icons-material/FormatClear";
import { useTiptap } from "@tiptap/react";
import { StyledIconButton } from "@/components/ui/StyledIconButton";

export default function ClearMarksButton() {
    const { editor } = useTiptap();

    return (
        <StyledIconButton
            onClick={() => editor.chain().focus().unsetAllMarks().run()}
        >
            <FormatClearIcon />
        </StyledIconButton>
    );
}
