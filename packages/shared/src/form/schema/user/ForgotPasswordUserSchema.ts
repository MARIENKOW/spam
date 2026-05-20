import { Email } from "../../fields";
import z from "zod";

export const ForgotPasswordUserSchema = z.object({
    email: Email,
});

export type ForgotPasswordUserDtoInput = z.input<
    typeof ForgotPasswordUserSchema
>;
export type ForgotPasswordUserDtoOutput = z.infer<
    typeof ForgotPasswordUserSchema
>;
