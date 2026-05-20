// schemas/avatar-upload.schema.ts
import { z } from "zod";
import { AVATAR_CONFIG } from "../../constants";
import { getMessageKey } from "../../../i18n";

export const AvatarUserSchema = z.object({
    image: z
        .instanceof(File, { message: getMessageKey("form.required") })
        .refine((f) => {
            return f.size <= AVATAR_CONFIG.maxFileSizeBytes;
        }, getMessageKey("form.file.avatar.tooLarge"))
        .refine(
            (f) => AVATAR_CONFIG.allowedMimeTypes.includes(f.type),
            getMessageKey("form.file.unsupportedType"),
        ),
});

export type AvatarUserInput = z.input<typeof AvatarUserSchema>;
export type AvatarUserOutput = z.output<typeof AvatarUserSchema>;
