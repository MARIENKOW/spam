"use client";

import { MuiColorInput, MuiColorInputProps } from "mui-color-input";

export function ColorPickerComponent(props: MuiColorInputProps) {
    return <MuiColorInput format="hex" {...props} />;
}
