import LinkIcon from "@mui/icons-material/Link";
import { useTiptap, useTiptapState } from "@tiptap/react";
import { usePrompt } from "@/hooks/usePrompt";
import { StyledIconButton } from "@/components/ui/StyledIconButton";

export default function LinkButton() {
    const { editor } = useTiptap();
    const isLink = useTiptapState((ctx) => ctx.editor.isActive("link"));
    const { prompt, promptDialog } = usePrompt();
    const handleClick = async () => {
        const previousUrl = editor.getAttributes("link").href as
            | string
            | undefined;
        const url = await prompt({
            defaultValue: previousUrl ?? "https://",
            title: "URL",
            label: "URL",
        });

        if (url === null) return;

        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }

        if (editor.state.selection.empty) {
            editor
                .chain()
                .focus()
                .insertContent(`<a href="${url}">${url}</a>`)
                .run();
        } else {
            editor
                .chain()
                .focus()
                .extendMarkRange("link")
                .setLink({ href: url })
                .run();
        }
    };

    return (
        <>
            {promptDialog}
            <StyledIconButton
                color={isLink ? "primary" : "default"}
                onClick={handleClick}
            >
                <LinkIcon />
            </StyledIconButton>
        </>
    );
}
