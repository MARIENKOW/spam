import * as React from "react";
import Box from "@mui/material/Box";
import { SelectChangeEvent } from "@mui/material/Select";
import { Selection } from "@tiptap/pm/state";
import { useTiptap, useTiptapState } from "@tiptap/react";
import { StyledFormControl } from "@/components/ui/StyledFormControl";
import { StyledInputLabel } from "@/components/ui/StyledInputLabel";
import { StyledSelect } from "@/components/ui/StyledSelect";
import { StyledMenuItem } from "@/components/ui/StyledMenuItem";

export type StyleValue =
    | "paragraph"
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "blockquote"
    | "codeBlock";

const STYLES: { value: StyleValue; label: string }[] = [
    { value: "paragraph", label: "Paragraph" },
    { value: "h1", label: "Heading 1" },
    { value: "h2", label: "Heading 2" },
    { value: "h3", label: "Heading 3" },
    { value: "h4", label: "Heading 4" },
    { value: "h5", label: "Heading 5" },
    { value: "h6", label: "Heading 6" },
];

export default function StyleButton() {
    const { editor } = useTiptap();
    const activeStyle = useTiptapState((ctx): StyleValue => {
        const e = ctx.editor;
        for (let level = 1; level <= 6; level++) {
            if (e.isActive("heading", { level }))
                return `h${level}` as StyleValue;
        }
        if (e.isActive("blockquote")) return "blockquote";
        if (e.isActive("codeBlock")) return "codeBlock";
        return "paragraph";
    });
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
        const value = event.target.value as StyleValue;
        const chain = editor.chain().focus();
        if (value === "paragraph") {
            chain.setParagraph().run();
        } else if (value.startsWith("h")) {
            chain
                .setHeading({
                    level: Number(value[1]) as 1 | 2 | 3 | 4 | 5 | 6,
                })
                .run();
        }
    };

    return (
        <Box display="inline-block" sx={{ minWidth: 120 }}>
            <StyledFormControl size="small" sx={{ minWidth: 120 }} fullWidth>
                <StyledSelect
                    value={activeStyle ?? "paragraph"}
                    onOpen={handleOpen}
                    onChange={handleChange}
                >
                    {STYLES.map(({ value, label }) => (
                        <StyledMenuItem key={value} value={value}>
                            {label}
                        </StyledMenuItem>
                    ))}
                </StyledSelect>
            </StyledFormControl>
        </Box>
    );
}
