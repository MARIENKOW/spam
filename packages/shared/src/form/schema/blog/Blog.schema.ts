import { z } from "zod";
import { getMessageKey } from "../../../i18n";
import { BLOG_IMAGE_CONFIG } from "../../constants";
import { BlogBody, BlogSubtitle, BlogTitle } from "../../fields";

const BlogBaseSchema = z.object({
    title: BlogTitle,
    subtitle: BlogSubtitle,
    publishedAt: z.coerce.date({ message: getMessageKey("form.required") }),
    imagesId: z.array(z.string()).optional(),
    videosId: z.array(z.string()).optional(),
    body: BlogBody,
});

const BlogImageSchema = z
    .union([z.instanceof(File), z.string()])
    .nullable()
    .refine((f) => f !== null, getMessageKey("form.required"))
    .refine(
        (f) => !(f instanceof File) || BLOG_IMAGE_CONFIG.allowedMimeTypes.includes(f.type),
        getMessageKey("form.file.unsupportedType"),
    )
    .refine(
        (f) => !(f instanceof File) || f.size <= BLOG_IMAGE_CONFIG.maxFileSizeBytes,
        getMessageKey("form.file.blogImage.tooLarge"),
    );

export const BlogSchema = BlogBaseSchema.extend({ image: BlogImageSchema });
export const BlogSchemaWithoutImage = BlogBaseSchema;

export type BlogInput = z.input<typeof BlogSchema>;
export type BlogOutput = z.output<typeof BlogSchema>;

export type BlogWithoutImageInput = z.input<typeof BlogSchemaWithoutImage>;
export type BlogWithoutImageOutput = z.output<typeof BlogSchemaWithoutImage>;
