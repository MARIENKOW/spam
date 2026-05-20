import { Email } from "../../fields";
import z from "zod";

export const ForgotPasswordAdminSchema = z.object({
    email: Email,
});

export type ForgotPasswordAdminDtoInput = z.input<typeof ForgotPasswordAdminSchema>;
export type ForgotPasswordAdminDtoOutput = z.infer<typeof ForgotPasswordAdminSchema>;
