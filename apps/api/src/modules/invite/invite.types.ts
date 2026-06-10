import { Invite, InviteChannel, InviteRecipient, InviteRun, InviteRunRecipient } from "@/generated/prisma";

export type InviteRecord = Invite & {
    channels: InviteChannel[];
    runs: InviteRun[];
};

export type InviteWithAll = Invite & {
    channels: InviteChannel[];
    recipients: InviteRecipient[];
    runs: InviteRun[];
};
