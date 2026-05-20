import * as React from "react";
import Box from "@mui/material/Box";
import { SelectChangeEvent } from "@mui/material/Select";
import { Selection } from "@tiptap/pm/state";
import { useTiptap, useTiptapState } from "@tiptap/react";
import { StyledFormControl } from "@/components/ui/StyledFormControl";
import { StyledInputLabel } from "@/components/ui/StyledInputLabel";
import { StyledSelect } from "@/components/ui/StyledSelect";
import { StyledMenuItem } from "@/components/ui/StyledMenuItem";

export default function FontsButton() {
    const { editor } = useTiptap();
    const activeFont = useTiptapState(
        (ctx) =>
            (ctx.editor.getAttributes("textStyle")?.fontFamily as
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
        if (value === "Default") {
            editor.chain().focus().unsetFontFamily().run();
        } else {
            editor.chain().focus().setFontFamily(value).run();
        }
    };

    return (
        <Box display="inline-block" sx={{ minWidth: 80 }}>
            <StyledFormControl
                size="small"
                sx={{ display: "inline-block", minWidth: 80 }}
                fullWidth
            >
                <StyledInputLabel
                    sx={{
                        display: !activeFont ? "block" : "none",
                    }}
                    shrink={false}
                    id="font-family-label"
                >
                    Font
                </StyledInputLabel>
                <StyledSelect
                    displayEmpty
                    labelId="font-family-label"
                    value={activeFont ?? ""}
                    sx={{ width: "100%" }}
                    onOpen={handleOpen}
                    onChange={handleChange}
                >
                    <StyledMenuItem  value="Default">
                        Default
                    </StyledMenuItem>
                    <StyledMenuItem sx={{ fontFamily: "Inter" }} value="Inter">
                        Inter
                    </StyledMenuItem>
                    <StyledMenuItem
                        sx={{ fontFamily: "Comic Sans MS, Comic Sans" }}
                        value="Comic Sans"
                    >
                        Comic Sans
                    </StyledMenuItem>
                    <StyledMenuItem
                        sx={{ fontFamily: "Monospace" }}
                        value="Monospace"
                    >
                        Monospace
                    </StyledMenuItem>
                    <StyledMenuItem
                        value="Cursive"
                        sx={{ fontFamily: "cursive" }}
                    >
                        Cursive
                    </StyledMenuItem>
                    <StyledMenuItem value="Default">Default</StyledMenuItem>
                </StyledSelect>
            </StyledFormControl>
        </Box>
    );
}
