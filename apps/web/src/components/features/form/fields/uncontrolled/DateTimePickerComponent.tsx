"use client";

import { DateLocalizationProvider } from "@/components/features/form/fields/uncontrolled/DateLocalizationProvider";
import { DateTimePicker, DateTimePickerProps } from "@mui/x-date-pickers/DateTimePicker";

export function DateTimePickerComponent(props: DateTimePickerProps) {
    return (
        <DateLocalizationProvider>
            <DateTimePicker {...props} />
        </DateLocalizationProvider>
    );
}
