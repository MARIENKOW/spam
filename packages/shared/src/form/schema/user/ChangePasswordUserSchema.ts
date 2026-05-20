import { Password } from "../../fields";
import { getMessageKey } from "../../../i18n";
import z from "zod";

export const ChangePasswordUserSchema = z
    .object({
        password: Password,
        rePassword: Password,
    })
    .refine((data) => data.password === data.rePassword, {
        message: getMessageKey("form.rePassword.same"),
        path: ["rePassword"],
    });

export type ChangePasswordUserDtoInput = z.input<
    typeof ChangePasswordUserSchema
>;
export type ChangePasswordUserDtoOutput = z.infer<
    typeof ChangePasswordUserSchema
>;
