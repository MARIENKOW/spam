-- AlterTable: Invite
ALTER TABLE "invites" ADD COLUMN "delayBaseSeconds" INTEGER NOT NULL DEFAULT 180;
ALTER TABLE "invites" ADD COLUMN "delayJitterSeconds" INTEGER NOT NULL DEFAULT 60;
ALTER TABLE "invites" ADD COLUMN "nextAttemptAt" TIMESTAMP(3);
ALTER TABLE "invites" ADD COLUMN "estimatedFinishAt" TIMESTAMP(3);

-- AlterTable: InviteRecipient
ALTER TABLE "invite_recipients" ADD COLUMN "delaySeconds" INTEGER;

-- AlterTable: InviteRun
ALTER TABLE "invite_runs" ADD COLUMN "delayBaseSeconds" INTEGER NOT NULL DEFAULT 180;
ALTER TABLE "invite_runs" ADD COLUMN "delayJitterSeconds" INTEGER NOT NULL DEFAULT 60;

-- AlterTable: InviteRunRecipient
ALTER TABLE "invite_run_recipients" ADD COLUMN "delaySeconds" INTEGER;

-- AlterTable: Broadcast
ALTER TABLE "broadcasts" ADD COLUMN "delayBaseSeconds" INTEGER NOT NULL DEFAULT 180;
ALTER TABLE "broadcasts" ADD COLUMN "delayJitterSeconds" INTEGER NOT NULL DEFAULT 60;
ALTER TABLE "broadcasts" ADD COLUMN "nextAttemptAt" TIMESTAMP(3);
ALTER TABLE "broadcasts" ADD COLUMN "estimatedFinishAt" TIMESTAMP(3);

-- AlterTable: BroadcastRecipient
ALTER TABLE "broadcast_recipients" ADD COLUMN "delaySeconds" INTEGER;

-- AlterTable: BroadcastRun
ALTER TABLE "broadcast_runs" ADD COLUMN "delayBaseSeconds" INTEGER NOT NULL DEFAULT 180;
ALTER TABLE "broadcast_runs" ADD COLUMN "delayJitterSeconds" INTEGER NOT NULL DEFAULT 60;

-- AlterTable: BroadcastRunRecipient
ALTER TABLE "broadcast_run_recipients" ADD COLUMN "delaySeconds" INTEGER;
