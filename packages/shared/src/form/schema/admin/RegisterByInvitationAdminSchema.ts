import { Password } from "../../fields";
import { getMessageKey } from "../../../i18n";
import z from "zod";

export const RegisterByInvitationAdminSchema = z
    .object({
        password: Password,
        rePassword: Password,
    })
    .refine((data) => data.password === data.rePassword, {
        message: getMessageKey("form.rePassword.same"),
        path: ["rePassword"],
    });

export type RegisterByInvitationAdminDtoInput = z.input<
    typeof RegisterByInvitationAdminSchema
>;
export type RegisterByInvitationAdminDtoOutput = z.output<
    typeof RegisterByInvitationAdminSchema
>;
