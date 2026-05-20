import { z } from "zod";

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, "").trim();

interface RichTextOptions {
    required?: string;
    min?: { value: number; message: string };
    max?: { value: number; message: string };
}

export const richTextSchema = ({ required, min, max }: RichTextOptions = {}) =>
    z.string().superRefine((html, ctx) => {
        const text = stripHtml(html);

        if (required !== undefined && !text.length) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: required });
            return;
        }

        if (min && text.length < min.value) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: min.message });
        }

        if (max && text.length > max.value) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: max.message });
        }
    });
