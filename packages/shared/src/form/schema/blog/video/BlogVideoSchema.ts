// schemas/avatar-upload.schema.ts
import { z } from "zod";
import { getMessageKey } from "../../../../i18n";
import { BLOG_VIDEO_CONFIG } from "../../../constants";

export const BlogVideosSchema = z.object({
    videos: z
        .array(
            z
                .instanceof(File, { message: getMessageKey("form.required") })
                .refine((f) => {
                    return f.size <= BLOG_VIDEO_CONFIG.maxFileSizeBytes;
                }, getMessageKey("form.file.blogVideo.tooLarge"))
                .refine(
                    (f) => BLOG_VIDEO_CONFIG.allowedMimeTypes.includes(f.type),
                    getMessageKey("form.file.unsupportedType"),
                ),
        )
        .min(1, getMessageKey("form.required")),
});

export type BlogVideosInput = z.input<typeof BlogVideosSchema>;
export type BlogVideosOutput = z.output<typeof BlogVideosSchema>;
