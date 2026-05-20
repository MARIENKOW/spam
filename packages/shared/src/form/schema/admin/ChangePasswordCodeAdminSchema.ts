import z from "zod";
import { getMessageKey } from "../../../i18n";
import { CHANGE_PASSWORD_OTP_LENGTH } from "../../constants";

export const ChangePasswordCodeAdminSchema = z.object({
    code: z
        .string()
        .length(CHANGE_PASSWORD_OTP_LENGTH, getMessageKey("form.code.length"))
        .regex(/^\d+$/, getMessageKey("form.code.digits")),
});

export type ChangePasswordCodeAdminDtoInput = z.input<
    typeof ChangePasswordCodeAdminSchema
>;
export type ChangePasswordCodeAdminDtoOutput = z.output<
    typeof ChangePasswordCodeAdminSchema
>;
