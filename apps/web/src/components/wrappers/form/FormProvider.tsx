"use client";

import React from "react";
import {
    FormProvider as RHFFormProvider,
    FieldValues,
    UseFormReturn,
} from "react-hook-form";

interface Props<
    TFieldValues extends FieldValues,
    TOutputFieldValues extends FieldValues,
> {
    form: UseFormReturn<TFieldValues, any, TOutputFieldValues>;
    children: React.ReactNode;
}

export default function FormProvider<
    TFieldValues extends FieldValues,
    TOutputFieldValues extends FieldValues = TFieldValues,
>({ form, children }: Props<TFieldValues, TOutputFieldValues>) {
    return <RHFFormProvider {...form}>{children}</RHFFormProvider>;
}
