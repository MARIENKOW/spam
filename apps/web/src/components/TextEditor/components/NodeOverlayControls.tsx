import { Box, IconButton, Tooltip } from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import HighlightOffTwoToneIcon from "@mui/icons-material/HighlightOffTwoTone";
import { StyledIconButton } from "@/components/ui/StyledIconButton";

type Align = "left" | "center" | "right";

interface Props {
    align: Align;
    onAlignChange: (align: Align) => void;
    onDelete: () => void;
    isDragging: boolean;
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
}

export default function NodeOverlayControls({
    align,
    onAlignChange,
    onDelete,
    isDragging,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
}: Props) {
    return (
        <>
            {/* Drag handle */}
            <Box
                data-drag-handle
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                sx={{
                    position: "absolute",
                    top: 4,
                    left: 4,
                    zIndex: 10,
                    cursor: isDragging ? "grabbing" : "grab",
                    touchAction: "none",
                    background: "background",
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    padding: "1px 2px",
                }}
            >
                <DragIndicatorIcon sx={{ fontSize: 20 }} />
            </Box>

            {/* Alignment controls */}
            <Box
                sx={{
                    position: "absolute",
                    top: 4,
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 10,
                    display: "flex",
                    background: "background",
                    borderRadius: "0px 0px 4px 4px",
                    padding: "1px",
                }}
            >
                <StyledIconButton
                    size="small"
                    sx={{
                        p: "2px",
                        color: align === "left" ? "primary.main" : "inherit",
                    }}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        onAlignChange("left");
                    }}
                >
                    <FormatAlignLeftIcon sx={{ fontSize: 20 }} />
                </StyledIconButton>
                <Tooltip title="Center">
                    <StyledIconButton
                        size="small"
                        sx={{
                            p: "2px",
                            color:
                                align === "center" ? "primary.main" : "inherit",
                        }}
                        onMouseDown={(e) => {
                            e.preventDefault();
                            onAlignChange("center");
                        }}
                    >
                        <FormatAlignCenterIcon sx={{ fontSize: 20 }} />
                    </StyledIconButton>
                </Tooltip>
                <Tooltip title="Right">
                    <StyledIconButton
                        size="small"
                        sx={{
                            p: "2px",
                            color:
                                align === "right" ? "primary.main" : "inherit",
                        }}
                        onMouseDown={(e) => {
                            e.preventDefault();
                            onAlignChange("right");
                        }}
                    >
                        <FormatAlignRightIcon sx={{ fontSize: 20 }} />
                    </StyledIconButton>
                </Tooltip>
            </Box>

            {/* Delete */}
            <Box
                sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    zIndex: 10,
                    background: "background",
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    padding: "1px",
                }}
            >
                <StyledIconButton
                    size="small"
                    sx={{ p: "2px" }}
                    onClick={onDelete}
                >
                    <HighlightOffTwoToneIcon color="error" />
                </StyledIconButton>
            </Box>
        </>
    );
}
