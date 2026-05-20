import Form, { CustomSubmitHandler } from "@/components/wrappers/form/Form";
import {
    DEFAULT_FORM_CONFIG,
    FormConfigPartial,
    FormConfigProvider,
    FormConfigType,
} from "@/components/wrappers/form/FormConfigProvider";
import FormProvider from "@/components/wrappers/form/FormProvider";
import useForm from "@/hooks/useForm";
import React from "react";
import { FieldValues, UseFormProps } from "react-hook-form";

export interface SimpleFormProps<
    TFieldValues extends FieldValues,
    TOutputFieldValues extends FieldValues,
> {
    children: React.ReactNode;
    params: UseFormProps<TFieldValues, any, TOutputFieldValues>;
    onSubmit: CustomSubmitHandler<TFieldValues, TOutputFieldValues>;
    formConfig?: FormConfigPartial;
}

export default function SimpleForm<
    TFieldValues extends FieldValues,
    TOutputFieldValues extends FieldValues = TFieldValues,
>({
    children,
    params,
    onSubmit,
    formConfig,
}: SimpleFormProps<TFieldValues, TOutputFieldValues>) {
    const form = useForm<TFieldValues, TOutputFieldValues>(params);

    const mergedConfig: FormConfigType = {
        fields: { ...DEFAULT_FORM_CONFIG.fields, ...formConfig?.fields },
        submit: { ...DEFAULT_FORM_CONFIG.submit, ...formConfig?.submit },
    };

    return (
        <FormConfigProvider value={mergedConfig}>
            <FormProvider<TFieldValues, TOutputFieldValues> form={form}>
                <Form form={form} onSubmit={onSubmit}>
                    {children}
                </Form>
            </FormProvider>
        </FormConfigProvider>
    );
}
