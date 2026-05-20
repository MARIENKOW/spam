// schemas/avatar-upload.schema.ts
import { z } from "zod";
import { getMessageKey } from "../../../../i18n";
import { BLOG_IMAGE_CONFIG } from "../../../constants";

export const BlogImageSchema = z.object({
    images: z
        .array(
            z
                .instanceof(File, { message: getMessageKey("form.required") })
                .refine((f) => {
                    return f.size <= BLOG_IMAGE_CONFIG.maxFileSizeBytes;
                }, getMessageKey("form.file.blogImage.tooLarge"))
                .refine(
                    (f) => BLOG_IMAGE_CONFIG.allowedMimeTypes.includes(f.type),
                    getMessageKey("form.file.unsupportedType"),
                ),
        )
        .min(1, getMessageKey("form.required")),
});

export type BlogImageInput = z.input<typeof BlogImageSchema>;
export type BlogImageOutput = z.output<typeof BlogImageSchema>;
