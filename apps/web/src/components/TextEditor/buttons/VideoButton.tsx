import VideoComponentBlog from "@/components/TextEditor/components/video/VideoComponentBlog";
import { VideoSelectContext } from "@/components/TextEditor/components/video/VideoSelectContext";
import { StyledDialog } from "@/components/ui/StyledDialog";
import { StyledIconButton } from "@/components/ui/StyledIconButton";
import { VideoDto } from "@myorg/shared/dto";
import { useTiptap } from "@tiptap/react";
import { useCallback, useState } from "react";
import VideoLibraryOutlinedIcon from "@mui/icons-material/VideoLibraryOutlined";

export default function VideoButton() {
    const { editor } = useTiptap();
    const [open, setOpen] = useState(false);

    const handleSelect = useCallback(
        (video: VideoDto) => {
            editor
                .chain()
                .focus()
                .setVideo({
                    src: video.url,
                    "data-id": video.id,
                    poster: video.image?.url,
                })
                .run();
            setOpen(false);
        },
        [editor],
    );

    return (
        <>
            <StyledIconButton onClick={() => setOpen(true)}>
                <VideoLibraryOutlinedIcon />
            </StyledIconButton>
            <StyledDialog
                maxWidth="md"
                fullWidth
                slotProps={{ paper: {} }}
                open={open}
                onClose={() => setOpen(false)}
            >
                <VideoSelectContext.Provider value={{ onSelect: handleSelect }}>
                    <VideoComponentBlog />
                </VideoSelectContext.Provider>
            </StyledDialog>
        </>
    );
}
