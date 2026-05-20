import { Email, Password } from "../../fields";
import { getMessageKey } from "../../../i18n";
import z from "zod";

export const RegisterUserSchema = z
    .object({
        password: Password,
        rePassword: Password,
        email: Email,
        // number: NumberBase,
    })
    .refine((data) => data.password === data.rePassword, {
        message: getMessageKey("form.rePassword.same"),
        path: ["rePassword"],
    });

export type RegisterUserDtoInput = z.input<typeof RegisterUserSchema>;
export type RegisterUserDtoOutput = z.infer<typeof RegisterUserSchema>;
