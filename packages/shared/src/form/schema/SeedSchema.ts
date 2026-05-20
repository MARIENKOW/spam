import { Email, Password } from "../fields";
import z from "zod";

export const SeedSchema = z.object({
    password: Password,
    email: Email,
});
