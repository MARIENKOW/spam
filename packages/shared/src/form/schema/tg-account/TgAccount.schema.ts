import { getMessageKey } from "../../../i18n";
import z from "zod";

export const TgAccountStartSchema = z.object({
    phone: z
        .string()
        .nonempty(getMessageKey("form.required"))
        .regex(/^\+\d{7,15}$/, getMessageKey("form.tgAccount.phone.invalid")),
});

export const TgAccountVerifySchema = z.object({
    phone: z.string().nonempty(getMessageKey("form.required")),
    phoneCodeHash: z.string().nonempty(),
    code: z
        .string()
        .nonempty(getMessageKey("form.required"))
        .regex(/^\d{5,6}$/, getMessageKey("form.code.digits")),
    password: z.string().optional(),
});

export type TgAccountStartInput = z.input<typeof TgAccountStartSchema>;
export type TgAccountStartOutput = z.output<typeof TgAccountStartSchema>;

export type TgAccountVerifyInput = z.input<typeof TgAccountVerifySchema>;
export type TgAccountVerifyOutput = z.output<typeof TgAccountVerifySchema>;
