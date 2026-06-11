import { z } from "zod";

export const UpdateBroadcastMessageSchema = z.object({
    message: z.string().min(1).max(4096),
});
export type UpdateBroadcastMessageOutput = z.infer<typeof UpdateBroadcastMessageSchema>;

export const SearchChannelSchema = z.object({
    query: z.string().min(1).max(100),
});
export type SearchChannelOutput = z.infer<typeof SearchChannelSchema>;

export const AddBroadcastChannelSchema = z.object({
    telegramId: z.string(),
    accessHash: z.string().nullable(),
    username: z.string().nullable(),
    title: z.string(),
    photoBase64: z.string().nullable(),
    memberCount: z.number().nullable(),
});
export type AddBroadcastChannelOutput = z.infer<typeof AddBroadcastChannelSchema>;

export const UpdateBroadcastDelaySchema = z.object({
    delayBaseSeconds: z.number().int().min(0).max(86400),
    delayJitterSeconds: z.number().int().min(0).max(86400),
});
export type UpdateBroadcastDelayOutput = z.infer<typeof UpdateBroadcastDelaySchema>;
