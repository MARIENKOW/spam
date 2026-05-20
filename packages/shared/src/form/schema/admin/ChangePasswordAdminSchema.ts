import { Email, Password } from "../../fields";
import { getMessageKey } from "../../../i18n";
import z from "zod";

export const ChangePasswordAdminSchema = z
    .object({
        password: Password,
        rePassword: Password,
    })
    .refine((data) => data.password === data.rePassword, {
        message: getMessageKey("form.rePassword.same"),
        path: ["rePassword"],
    });

export type ChangePasswordAdminDtoInput = z.input<
    typeof ChangePasswordAdminSchema
>;
export type ChangePasswordAdminDtoOutput = z.infer<
    typeof ChangePasswordAdminSchema
>;
