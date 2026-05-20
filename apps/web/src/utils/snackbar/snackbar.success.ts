import { toast } from "sonner";

export const snackbarSuccess = (value: string) => {
    return toast.success(value,{position:'bottom-center'});
};
