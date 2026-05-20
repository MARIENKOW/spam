"use client";

import { StyledSlider } from "@/components/ui/StyledSlider";
import FieldControll from "@/components/wrappers/form/FieldControll";
import { SliderProps } from "@mui/material";
import { FieldValues, Path } from "react-hook-form";

type FormSliderProps<T extends FieldValues> = {
    name: Path<T>;
} & Omit<SliderProps, "value" | "onChange">;

export default function FormSlider<T extends FieldValues>({
    name,
    ...rest
}: FormSliderProps<T>) {
    return (
        <FieldControll name={name}>
            {({ field: { value, onChange } }) => (
                <StyledSlider
                    value={value ?? 0}
                    onChange={(_, v) => onChange(v)}
                    {...rest}
                />
            )}
        </FieldControll>
    );
}
