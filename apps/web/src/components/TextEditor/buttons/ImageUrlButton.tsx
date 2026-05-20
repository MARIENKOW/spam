import ImageIcon from "@mui/icons-material/Image";
import { useTiptap } from "@tiptap/react";
import { usePrompt } from "@/hooks/usePrompt";
import { StyledIconButton } from "@/components/ui/StyledIconButton";

export default function ImageUrlButton() {
    const { editor } = useTiptap();
    const { prompt, promptDialog } = usePrompt();

    const handleClick = async () => {
        const url = await prompt({
            label: "URL",
            defaultValue: "https://",
            title: "Image URL",
        });
        if (url) {
            editor.chain().focus().setImageUrl({ src: url }).run();
        }
    };

    return (
        <>
            {promptDialog}
            <StyledIconButton onClick={handleClick}>
                <ImageIcon />
            </StyledIconButton>
        </>
    );
}
