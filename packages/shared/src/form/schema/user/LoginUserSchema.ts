import { Email, Password } from "../../fields";
import z from "zod";

export const LoginUserSchema = z.object({
    password: Password,
    email: Email,
});

export type LoginUserDtoInput = z.input<typeof LoginUserSchema>;
export type LoginUserDtoOutput = z.infer<typeof LoginUserSchema>;
