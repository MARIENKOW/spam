import { Box } from "@mui/material";
import { useTiptapState } from "@tiptap/react";

export default function CharacterCountBar() {
    const { words, characters } = useTiptapState((ctx) => ({
        words: ctx.editor.storage.characterCount?.words() ?? 0,
        characters: ctx.editor.storage.characterCount?.characters() ?? 0,
    }));

    return (
        <Box
            sx={{
                px: 1.5,
                py: 0.5,
                display: "flex",
                justifyContent: "flex-end",
                color: "text.disabled",
                fontSize: 12,
                borderTop: "1px solid",
                borderColor: "divider",
            }}
        >
            {words} words · {characters} chars
        </Box>
    );
}
