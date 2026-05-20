import ImageIcon from "@mui/icons-material/Image";
import { useTiptap } from "@tiptap/react";
import { useCallback, useState } from "react";
import { ImageDto } from "@myorg/shared/dto";
import { StyledIconButton } from "@/components/ui/StyledIconButton";
import { StyledDialog } from "@/components/ui/StyledDialog";
import { ImageSelectContext } from "@/components/TextEditor/components/image/ImageSelectContext";
import ImageComponentBlog from "@/components/TextEditor/components/image/ImageComponentBlog";

export default function ImageButton() {
    const { editor } = useTiptap();
    const [open, setOpen] = useState(false);

    const handleSelect = useCallback(
        (image: ImageDto) => {
            editor.chain().focus().setImage({ src: image.url, "data-id": image.id }).run();
            setOpen(false);
        },
        [editor],
    );

    return (
        <>
            <StyledIconButton onClick={() => setOpen(true)}>
                <ImageIcon />
            </StyledIconButton>
            <StyledDialog
                maxWidth="md"
                fullWidth
                slotProps={{ paper: {} }}
                open={open}
                onClose={() => setOpen(false)}
            >
                <ImageSelectContext.Provider value={{ onSelect: handleSelect }}>
                    <ImageComponentBlog />
                </ImageSelectContext.Provider>
            </StyledDialog>
        </>
    );
}
