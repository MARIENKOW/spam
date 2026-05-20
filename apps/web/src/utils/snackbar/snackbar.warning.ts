import { toast } from "sonner";

export const snackbarWarning = (value: string) => {
    return toast.warning(value,{position:'bottom-center'});
};
