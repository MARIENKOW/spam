"use client";

import { DateLocalizationProvider } from "@/components/features/form/fields/uncontrolled/DateLocalizationProvider";
import { DatePicker, DatePickerProps } from "@mui/x-date-pickers/DatePicker";

export function DatePickerComponent(props: DatePickerProps) {
    return (
        <DateLocalizationProvider>
            <DatePicker {...props} />
        </DateLocalizationProvider>
    );
}
