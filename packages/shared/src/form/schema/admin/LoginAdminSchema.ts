import { Email, Password } from "../../fields";
import z from "zod";

export const LoginAdminSchema = z.object({
    password: Password,
    email: Email,
});

export type LoginAdminDtoInput = z.input<typeof LoginAdminSchema>;
export type LoginAdminDtoOutput = z.infer<typeof LoginAdminSchema>;
