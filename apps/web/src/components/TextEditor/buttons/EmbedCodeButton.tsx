import CodeIcon from "@mui/icons-material/Code";
import { useTiptap } from "@tiptap/react";
import { useEmbedCode } from "@/hooks/useEmbedCode";
import { StyledIconButton } from "@/components/ui/StyledIconButton";

export default function EmbedCodeButton() {
    const { editor } = useTiptap();
    const { promptEmbedCode, embedCodeDialog } = useEmbedCode();

    const handleClick = async () => {
        const code = await promptEmbedCode();
        if (code?.trim()) {
            editor.chain().focus().setEmbedCode({ code: code.trim() }).run();
        }
    };

    return (
        <>
            {embedCodeDialog}
            <StyledIconButton onClick={handleClick}>
                <CodeIcon />
            </StyledIconButton>
        </>
    );
}
