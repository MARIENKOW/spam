import * as React from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Tooltip from "@mui/material/Tooltip";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import { useTiptap, useTiptapState } from "@tiptap/react";
import { Selection } from "@tiptap/pm/state";
import { StyledPopover } from "@/components/ui/StyledPopover";
import { StyledIconButton } from "@/components/ui/StyledIconButton";
import * as uuid from "uuid";

const COLORS = [
    { label: "None", value: null, id: uuid.v4() },
    { label: "Yellow", value: "#fef08a", id: uuid.v4() },
    { label: "Orange", value: "#fed7aa", id: uuid.v4() },
    { label: "Pink", value: "#fecdd3", id: uuid.v4() },
    { label: "Purple", value: "#e9d5ff", id: uuid.v4() },
    { label: "Blue", value: "#bfdbfe", id: uuid.v4() },
    { label: "Green", value: "#bbf7d0", id: uuid.v4() },
    { label: "Gray", value: "#e5e7eb", id: uuid.v4() },
];

export default function HighlightButton() {
    const { editor } = useTiptap();
    const activeHighlight = useTiptapState(
        (ctx) =>
            (ctx.editor.getAttributes("highlight")?.color as
                | string
                | undefined) ?? "",
    );
    const [anchor, setAnchor] = React.useState<HTMLButtonElement | null>(null);
    const savedSelection = React.useRef<Selection | null>(null);

    const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
        savedSelection.current = editor.state.selection;
        setAnchor(e.currentTarget);
    };

    const handleClose = () => setAnchor(null);

    const handleSelect = (value: string | null) => {
        if (savedSelection.current) {
            editor.view.dispatch(
                editor.state.tr.setSelection(savedSelection.current as never),
            );
        }
        if (!value) {
            editor.chain().focus().unsetHighlight().run();
        } else {
            editor.chain().focus().setHighlight({ color: value }).run();
        }
        handleClose();
    };

    return (
        <>
            <StyledIconButton onClick={handleOpen}>
                <Box
                    sx={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <BorderColorIcon />
                    <Box
                        sx={{
                            position: "absolute",
                            bottom: -2,
                            left: 0,
                            right: 0,
                            height: 3,
                            backgroundColor: activeHighlight || "transparent",
                            border: activeHighlight ? "none" : "1px solid #ccc",
                        }}
                    />
                </Box>
            </StyledIconButton>
            <StyledPopover
                open={Boolean(anchor)}
                anchorEl={anchor}
                onClose={handleClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            >
                <Box
                    sx={{
                        p: 1,
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 24px)",
                        gap: 0.5,
                    }}
                >
                    {COLORS.map(({ label, value, id }) => (
                        <Box
                            key={id}
                            onClick={() => handleSelect(value)}
                            sx={{
                                width: 24,
                                height: 24,
                                borderRadius: 1,
                                cursor: "pointer",
                                backgroundColor: value ?? "transparent",
                                border: "1px solid",
                                borderColor:
                                    value === activeHighlight
                                        ? "primary.main"
                                        : "grey.400",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 10,
                                "&:hover": { borderColor: "primary.main" },
                            }}
                        >
                            {!value && "✕"}
                        </Box>
                    ))}
                </Box>
            </StyledPopover>
        </>
    );
}
