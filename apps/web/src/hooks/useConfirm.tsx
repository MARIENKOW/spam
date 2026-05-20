import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useState, ReactNode } from "react";

interface UseConfirmOptions {
    title?: string;
    description?: string;
}

export const useConfirm = () => {
    const [open, setOpen] = useState(false);
    const [resolveFn, setResolveFn] = useState<(value: boolean) => void>();
    const [options, setOptions] = useState<UseConfirmOptions>({});

    const confirm = (params?: UseConfirmOptions) => {
        setOptions(params || {});
        setOpen(true);
        return new Promise<boolean>((resolve) => {
            setResolveFn(() => resolve);
        });
    };

    const handleConfirm = () => {
        setOpen(false);
        resolveFn?.(true);
    };

    const handleCancel = () => {
        setOpen(false);
        resolveFn?.(false);
    };

    const confirmDialog: ReactNode = (
        <ConfirmDialog
            open={open}
            title={options.title}
            description={options.description}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
        />
    );

    return { confirm, confirmDialog };
};
