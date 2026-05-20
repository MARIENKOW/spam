// components/wrappers/Form.tsx
import React from "react";
import { FieldValues, UseFormReturn } from "react-hook-form";

export type CustomSubmitHandler<
    TFieldValues extends FieldValues,
    TOutputFieldValues extends FieldValues = TFieldValues,
> = (
    data: TOutputFieldValues,
    methods: UseFormReturn<TFieldValues, any, TOutputFieldValues>,
    event?: React.BaseSyntheticEvent,
) => void | Promise<void>;

interface Props<
    TFieldValues extends FieldValues,
    TOutputFieldValues extends FieldValues,
> {
    form: UseFormReturn<TFieldValues, any, TOutputFieldValues>;
    onSubmit: CustomSubmitHandler<TFieldValues, TOutputFieldValues>;
    children: React.ReactNode;
}

export default function Form<
    TFieldValues extends FieldValues,
    TOutputFieldValues extends FieldValues = TFieldValues,
>({ form, onSubmit, children }: Props<TFieldValues, TOutputFieldValues>) {
    return (
        <form
            style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                gap: "15px",
            }}
            onSubmit={form.handleSubmit((data, event) =>
                onSubmit(data, form, event),
            )}
        >
            {children}
        </form>
    );
}
