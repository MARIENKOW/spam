import { Box } from "@mui/material";
import { StyledDivider } from "@/components/ui/StyledDivider";


import ImageButton from "@/components/TextEditor/buttons/ImageButton";
import BoldButton from "@/components/TextEditor/buttons/BoldButton";
import ItalicButton from "@/components/TextEditor/buttons/ItalicButton";
import StrikeButton from "@/components/TextEditor/buttons/StrikeButton";
import UnderlineButton from "@/components/TextEditor/buttons/UnderlineButton";
import SubscriptButton from "@/components/TextEditor/buttons/SubscriptButton";
import SuperscriptButton from "@/components/TextEditor/buttons/SuperscriptButton";
import ClearMarksButton from "@/components/TextEditor/buttons/ClearMarksButton";
import ColorButton from "@/components/TextEditor/buttons/ColorButton";
import HighlightButton from "@/components/TextEditor/buttons/HighlightButton";
import LinkButton from "@/components/TextEditor/buttons/LinkButton";
import OrderedListButton from "@/components/TextEditor/buttons/OrderedListButton";
import BulletListButton from "@/components/TextEditor/buttons/BulletListButton";
import AlignButton from "@/components/TextEditor/buttons/AlignButton";
import VideoButton from "@/components/TextEditor/buttons/VideoButton";
import EmbedCodeButton from "@/components/TextEditor/buttons/EmbedCodeButton";
import FontsButton from "@/components/TextEditor/buttons/FontsButton";
import StyleButton from "@/components/TextEditor/buttons/StyleButton";
import FontSizeButton from "@/components/TextEditor/buttons/FontSizeButton";

export default function BlogToolbar() {
    return (
        <>
            <BoldButton />
            <ItalicButton />
            <StrikeButton />
            <UnderlineButton />
            <SubscriptButton />
            <SuperscriptButton />
            <ClearMarksButton />

            <StyledDivider orientation="vertical" flexItem />

            <ColorButton />
            <HighlightButton />

            <StyledDivider orientation="vertical" flexItem />

            <LinkButton />

            <StyledDivider orientation="vertical" flexItem />

            <BulletListButton />
            <OrderedListButton />

            <StyledDivider orientation="vertical" flexItem />

            <AlignButton align="left" />
            <AlignButton align="center" />
            <AlignButton align="right" />

            <StyledDivider orientation="vertical" flexItem />

            <ImageButton />
            <VideoButton />
            <EmbedCodeButton />
            <StyledDivider orientation="vertical" flexItem sx={{ mr: 1 }} />

            <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
                <FontsButton />
                <StyleButton />
                <FontSizeButton />
            </Box>
        </>
    );
}
