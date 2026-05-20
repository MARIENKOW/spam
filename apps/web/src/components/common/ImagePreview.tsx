import React from "react";
import { StyledIconButton } from "@/components/ui/StyledIconButton";
import { Box, BoxProps } from "@mui/material";
import HighlightOffTwoToneIcon from "@mui/icons-material/HighlightOffTwoTone";

export type DeleteButtonPosition =
    // Corners — inside
    | "top-left-inside"
    | "top-right-inside"
    | "bottom-left-inside"
    | "bottom-right-inside"
    // Edge centers — inside
    | "top-center-inside"
    | "bottom-center-inside"
    | "left-center-inside"
    | "right-center-inside"
    // Corners — outside, по горизонтальной оси (left/right)
    | "top-left-outside"
    | "top-right-outside"
    | "bottom-left-outside"
    | "bottom-right-outside"
    // Corners — outside, по вертикальной оси (up/down)
    | "top-left-outside-alt"
    | "top-right-outside-alt"
    | "bottom-left-outside-alt"
    | "bottom-right-outside-alt"
    // Corners — outside, по диагонали
    | "top-left-outside-diagonal"
    | "top-right-outside-diagonal"
    | "bottom-left-outside-diagonal"
    | "bottom-right-outside-diagonal"
    // Edge centers — outside
    | "top-center-outside"
    | "bottom-center-outside"
    | "left-center-outside"
    | "right-center-outside";

const OFFSET = 6;

const positionSx: Record<DeleteButtonPosition, React.CSSProperties> = {
    // Corners inside
    "top-left-inside": { top: OFFSET, left: OFFSET },
    "top-right-inside": { top: OFFSET, right: OFFSET },
    "bottom-left-inside": { bottom: OFFSET, left: OFFSET },
    "bottom-right-inside": { bottom: OFFSET, right: OFFSET },
    // Edge centers inside
    "top-center-inside": {
        top: OFFSET,
        left: "50%",
        transform: "translateX(-50%)",
    },
    "bottom-center-inside": {
        bottom: OFFSET,
        left: "50%",
        transform: "translateX(-50%)",
    },
    "left-center-inside": {
        top: "50%",
        left: OFFSET,
        transform: "translateY(-50%)",
    },
    "right-center-inside": {
        top: "50%",
        right: OFFSET,
        transform: "translateY(-50%)",
    },
    // Corners outside — horizontal axis
    "top-left-outside": { top: 0, left: 0, transform: "translateX(-100%)" },
    "top-right-outside": { top: 0, right: 0, transform: "translateX(100%)" },
    "bottom-left-outside": {
        bottom: 0,
        left: 0,
        transform: "translateX(-100%)",
    },
    "bottom-right-outside": {
        bottom: 0,
        right: 0,
        transform: "translateX(100%)",
    },
    // Corners outside — vertical axis
    "top-left-outside-alt": { top: 0, left: 0, transform: "translateY(-100%)" },
    "top-right-outside-alt": {
        top: 0,
        right: 0,
        transform: "translateY(-100%)",
    },
    "bottom-left-outside-alt": {
        bottom: 0,
        left: 0,
        transform: "translateY(100%)",
    },
    "bottom-right-outside-alt": {
        bottom: 0,
        right: 0,
        transform: "translateY(100%)",
    },
    // Corners outside — diagonal
    "top-left-outside-diagonal": {
        top: 0,
        left: 0,
        transform: "translate(-50%, -50%)",
    },
    "top-right-outside-diagonal": {
        top: 0,
        right: 0,
        transform: "translate(50%, -50%)",
    },
    "bottom-left-outside-diagonal": {
        bottom: 0,
        left: 0,
        transform: "translate(-50%, 50%)",
    },
    "bottom-right-outside-diagonal": {
        bottom: 0,
        right: 0,
        transform: "translate(50%, 50%)",
    },
    // Edge centers outside
    "top-center-outside": {
        top: 0,
        left: "50%",
        transform: "translate(-50%, -100%)",
    },
    "bottom-center-outside": {
        bottom: 0,
        left: "50%",
        transform: "translate(-50%, 100%)",
    },
    "left-center-outside": {
        top: "50%",
        left: 0,
        transform: "translate(-100%, -50%)",
    },
    "right-center-outside": {
        top: "50%",
        right: 0,
        transform: "translate(100%, -50%)",
    },
};

export type ImagePreviewProps = {
    height?: BoxProps["height"];
    width?: BoxProps["width"];
    src: string;
    onDelete: () => void;
    objectFit?: React.CSSProperties["objectFit"];
    deleteButtonPosition?: DeleteButtonPosition;
};

export default function ImagePreview({
    src,
    onDelete,
    objectFit = "cover",
    height = "100%",
    width = "100%",
    deleteButtonPosition = "top-right-inside",
}: ImagePreviewProps) {
    return (
        <Box flex={1} height={height} position="relative" width={width}>
            <Box borderRadius={2} overflow="hidden" height="100%" width="100%">
                <Box
                    component="img"
                    sx={{ objectFit, display: "block" }}
                    height="100%"
                    width="100%"
                    src={src}
                />
            </Box>
            <Box
                sx={{
                    position: "absolute",
                    zIndex: 10,
                    display: "flex",
                    background: "background",
                    borderRadius: 10,
                    alignItems: "center",
                    padding: "1px",

                    ...positionSx[deleteButtonPosition],
                }}
            >
                <StyledIconButton
                    size="small"
                    sx={{ p: "1px" }}
                    onClick={onDelete}
                >
                    <HighlightOffTwoToneIcon color="error" />
                </StyledIconButton>
            </Box>
        </Box>
    );
}
