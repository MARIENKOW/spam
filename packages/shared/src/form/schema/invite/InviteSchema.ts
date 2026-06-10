import { z } from "zod";

export const SetInviteTargetChannelSchema = z.object({
    telegramId: z.string(),
    accessHash: z.string(),
    title: z.string(),
    username: z.string().nullable(),
    photoBase64: z.string().nullable(),
});
export type SetInviteTargetChannelOutput = z.infer<typeof SetInviteTargetChannelSchema>;

export const AddInviteChannelSchema = z.object({
    telegramId: z.string(),
    accessHash: z.string().nullable(),
    username: z.string().nullable(),
    title: z.string(),
    photoBase64: z.string().nullable(),
    memberCount: z.number().nullable(),
});
export type AddInviteChannelOutput = z.infer<typeof AddInviteChannelSchema>;
