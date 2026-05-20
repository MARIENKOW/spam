import { PromptDialog } from "@/components/common/PromptDialog";
import { useState, ReactNode } from "react";

interface UsePromptOptions {
    title?: string;
    label?: string;
    defaultValue?: string;
}

export const usePrompt = () => {
    const [open, setOpen] = useState(false);
    const [resolveFn, setResolveFn] =
        useState<(value: string | null) => void>();
    const [options, setOptions] = useState<UsePromptOptions>({});

    const prompt = ({
        label,
        defaultValue,
        title,
    }: {
        label?: string;
        defaultValue?: string;
        title: string;
    }) => {
        setOptions({ title, label, defaultValue });
        setOpen(true);
        return new Promise<string | null>((resolve) => {
            setResolveFn(() => resolve);
        });
    };

    const handleConfirm = (value: string) => {
        setOpen(false);
        resolveFn?.(value);
    };

    const handleCancel = () => {
        setOpen(false);
        resolveFn?.(null);
    };

    const promptDialog: ReactNode = (
        <PromptDialog
            open={open}
            title={options.title}
            label={options.label}
            defaultValue={options.defaultValue}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
        />
    );

    return { prompt, promptDialog };
};
