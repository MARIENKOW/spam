import {
    Broadcast,
    BroadcastChannel,
    BroadcastRecipient,
    BroadcastRun,
} from "@/generated/prisma";

export type BroadcastRecord = Broadcast & {
    channels: BroadcastChannel[];
    runs: BroadcastRun[];
    _count: { recipients: number };
};

export type BroadcastWithProgress = Broadcast & {
    channels: BroadcastChannel[];
    runs: BroadcastRun[];
    _count: {
        recipients: number;
    };
    pendingCount: number;
    sentCount: number;
    failedCount: number;
};
