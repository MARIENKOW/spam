import z from "zod";
import { Password } from "../../fields";
import { getMessageKey } from "../../../i18n";

export const ChangePasswordSettingsAdminSchema = z
    .object({
        currentPassword: Password,
        newPassword: Password,
        rePassword: Password,
    })
    .refine((data) => data.newPassword === data.rePassword, {
        message: getMessageKey("form.rePassword.same"),
        path: ["rePassword"],
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
        message: getMessageKey("form.newPassword.sameAsCurrent"),
        path: ["newPassword"],
    });

export type ChangePasswordSettingsAdminDtoInput = z.input<
    typeof ChangePasswordSettingsAdminSchema
>;
export type ChangePasswordSettingsAdminDtoOutput = z.output<
    typeof ChangePasswordSettingsAdminSchema
>;
