import LinkIcon from "@mui/icons-material/Link";
import { useTiptap } from "@tiptap/react";
import { usePrompt } from "@/hooks/usePrompt";
import { StyledIconButton } from "@/components/ui/StyledIconButton";

export default function VideoUrlButton() {
    const { editor } = useTiptap();
    const { prompt, promptDialog } = usePrompt();

    const handleClick = async () => {
        const url = await prompt({
            label: "URL",
            defaultValue: "https://",
            title: "Video URL",
        });
        if (url) {
            editor.chain().focus().setVideoUrl({ src: url }).run();
        }
    };

    return (
        <>
            {promptDialog}
            <StyledIconButton onClick={handleClick}>
                <LinkIcon />
            </StyledIconButton>
        </>
    );
}
