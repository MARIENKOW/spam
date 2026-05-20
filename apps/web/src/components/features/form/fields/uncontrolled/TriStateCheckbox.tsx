"use client";

import { StyledCheckbox } from "@/components/ui/StyledCheckbox";
import { Checkbox, FormControlLabel } from "@mui/material";

export type TriState = "all" | "yes" | "no";

const CYCLE: Record<TriState, TriState> = {
    all: "yes",
    yes: "no",
    no: "all",
};

interface TriStateCheckboxProps {
    value: TriState;
    onChange: (v: TriState) => void;
    label: string;
}

export function TriStateCheckbox({
    value,
    onChange,
    label,
}: TriStateCheckboxProps) {
    return (
        <FormControlLabel
            label={label}
            control={
                <StyledCheckbox
                    checked={value === "yes"}
                    indeterminate={value === "no"}
                    onChange={() => onChange(CYCLE[value])}
                    color={value === "no" ? "error" : "primary"}
                />
            }
        />
    );
}
