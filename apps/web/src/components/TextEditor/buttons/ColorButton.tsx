import * as React from "react";
import Box from "@mui/material/Box";
import FormatColorTextIcon from "@mui/icons-material/FormatColorText";
import { useTiptap, useTiptapState } from "@tiptap/react";
import { Selection } from "@tiptap/pm/state";
import { StyledIconButton } from "@/components/ui/StyledIconButton";
import { StyledPopover } from "@/components/ui/StyledPopover";
import * as uuid from "uuid";

const COLORS = [
    { label: "Default", value: null, id: uuid.v4() },
    { label: "Gray", value: "#6b7280", id: uuid.v4() },
    { label: "Red", value: "#ef4444", id: uuid.v4() },
    { label: "Orange", value: "#f97316", id: uuid.v4() },
    { label: "Yellow", value: "#eab308", id: uuid.v4() },
    { label: "Green", value: "#22c55e", id: uuid.v4() },
    { label: "Teal", value: "#14b8a6", id: uuid.v4() },
    { label: "Blue", value: "#3b82f6", id: uuid.v4() },
    { label: "Indigo", value: "#6366f1", id: uuid.v4() },
    { label: "Purple", value: "#a855f7", id: uuid.v4() },
    { label: "Pink", value: "#ec4899", id: uuid.v4() },
];

export default function ColorButton() {
    const { editor } = useTiptap();
    const activeColor = useTiptapState(
        (ctx) =>
            (ctx.editor.getAttributes("textStyle")?.color as
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
                editor.state.tr.setSelection(savedSelection.current),
            );
        }
        if (!value) {
            editor.chain().focus().unsetColor().run();
        } else {
            editor.chain().focus().setColor(value).run();
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
                    <FormatColorTextIcon />
                    <Box
                        sx={{
                            position: "absolute",
                            bottom: -2,
                            left: 0,
                            right: 0,
                            height: 3,
                            backgroundColor: activeColor || "transparent",
                            border: activeColor ? "none" : "1px solid #ccc",
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
                        gridTemplateColumns: "repeat(7, 24px)",
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
                                    value === activeColor
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
