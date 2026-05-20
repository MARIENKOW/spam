// hooks/useAppForm.ts
import {
    FieldValues,
    useForm as useFormMui,
    UseFormProps,
} from "react-hook-form";

const DEFAULT_FORM_OPTIONS = {
    mode: "onChange",
    reValidateMode: "onChange",
    shouldFocusError: true,
} as const;

export default function useForm<
    TFieldValues extends FieldValues,
    TOutputFieldValues extends FieldValues = TFieldValues,
>(params: UseFormProps<TFieldValues, any, TOutputFieldValues>) {
    return useFormMui<TFieldValues, any, TOutputFieldValues>({
        ...DEFAULT_FORM_OPTIONS,
        ...params,
    });
}
