import { EmbedCodeDialog } from "@/components/common/EmbedCodeDialog";
import { useState, ReactNode } from "react";

export const useEmbedCode = () => {
    const [open, setOpen] = useState(false);
    const [resolveFn, setResolveFn] = useState<(value: string | null) => void>();

    const promptEmbedCode = () => {
        setOpen(true);
        return new Promise<string | null>((resolve) => {
            setResolveFn(() => resolve);
        });
    };

    const handleConfirm = (code: string) => {
        setOpen(false);
        resolveFn?.(code);
    };

    const handleCancel = () => {
        setOpen(false);
        resolveFn?.(null);
    };

    const embedCodeDialog: ReactNode = (
        <EmbedCodeDialog open={open} onConfirm={handleConfirm} onCancel={handleCancel} />
    );

    return { promptEmbedCode, embedCodeDialog };
};
