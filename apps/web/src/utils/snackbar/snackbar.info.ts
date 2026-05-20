import { toast } from "sonner";

export const snackbarInfo = (value: string) => {
    return toast.info(value,{position:'bottom-center'});
};
