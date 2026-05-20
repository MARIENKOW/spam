import * as React from "react";
import Box from "@mui/material/Box";
import { SelectChangeEvent } from "@mui/material/Select";
import { Selection } from "@tiptap/pm/state";
import { useTiptap, useTiptapState } from "@tiptap/react";
import { StyledFormControl } from "@/components/ui/StyledFormControl";
import { StyledInputLabel } from "@/components/ui/StyledInputLabel";
import { StyledSelect } from "@/components/ui/StyledSelect";
import { StyledMenuItem } from "@/components/ui/StyledMenuItem";

const SIZES = [
    "10px",
    "12px",
    "14px",
    "16px",
    "18px",
    "20px",
    "24px",
    "28px",
    "32px",
    "36px",
    "48px",
    "64px",
];

export default function FontSizeButton() {
    const { editor } = useTiptap();
    const activeFontSize = useTiptapState(
        (ctx) =>
            (ctx.editor.getAttributes("textStyle")?.fontSize as
                | string
                | undefined) ?? "",
    );
    const savedSelection = React.useRef<Selection | null>(null);

    const handleOpen = () => {
        savedSelection.current = editor.state.selection;
    };

    const handleChange = (event: SelectChangeEvent<unknown>) => {
        if (savedSelection.current) {
            editor.view.dispatch(
                editor.state.tr.setSelection(savedSelection.current),
            );
        }
        const value = event.target.value as string;
        if (!value) {
            editor.chain().focus().unsetFontSize().run();
        } else {
            editor.chain().focus().setFontSize(value).run();
        }
    };

    return (
        <Box display="inline-block" sx={{ minWidth: 80 }}>
            <StyledFormControl size="small" sx={{ minWidth: 80 }} fullWidth>
                <StyledInputLabel
                    sx={{
                        display: !activeFontSize ? "block" : "none",
                    }}
                    shrink={false}
                    id="font-size-label"
                >
                    Size
                </StyledInputLabel>
                <StyledSelect
                    labelId="font-size-label"
                    value={activeFontSize ?? ""}
                    // label="Size"
                    onOpen={handleOpen}
                    onChange={handleChange}
                >
                    <StyledMenuItem value="">Default</StyledMenuItem>
                    {SIZES.map((size) => (
                        <StyledMenuItem
                            key={size}
                            value={size}
                            sx={{ fontSize: size }}
                        >
                            {size}
                        </StyledMenuItem>
                    ))}
                </StyledSelect>
            </StyledFormControl>
        </Box>
    );
}
