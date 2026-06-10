-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('DRAFT', 'RUNNING', 'COMPLETED', 'STOPPED');

-- CreateTable
CREATE TABLE "invites" (
    "id" TEXT NOT NULL,
    "tgAccountId" TEXT NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'DRAFT',
    "targetChannelTelegramId" TEXT,
    "targetChannelAccessHash" TEXT,
    "targetChannelTitle" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invite_channels" (
    "id" TEXT NOT NULL,
    "inviteId" TEXT NOT NULL,
    "telegramId" TEXT NOT NULL,
    "username" TEXT,
    "title" TEXT NOT NULL,
    "photoUrl" TEXT,
    "memberCount" INTEGER,
    "recipientCount" INTEGER,

    CONSTRAINT "invite_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invite_recipients" (
    "id" TEXT NOT NULL,
    "inviteId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessHash" TEXT,
    "username" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "status" "RecipientStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "invitedAt" TIMESTAMP(3),

    CONSTRAINT "invite_recipients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invite_runs" (
    "id" TEXT NOT NULL,
    "inviteId" TEXT NOT NULL,
    "targetChannelSnapshot" JSONB NOT NULL DEFAULT '{}',
    "channelsSnapshot" JSONB NOT NULL DEFAULT '[]',
    "status" "RunStatus" NOT NULL,
    "invitedCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "totalCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invite_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invite_run_recipients" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "status" "RecipientStatus" NOT NULL,
    "errorMessage" TEXT,
    "invitedAt" TIMESTAMP(3),

    CONSTRAINT "invite_run_recipients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tg_owned_channels" (
    "id" TEXT NOT NULL,
    "telegramId" TEXT NOT NULL,
    "accessHash" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "username" TEXT,
    "photoBase64" TEXT,
    "memberCount" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tgAccountId" TEXT NOT NULL,

    CONSTRAINT "tg_owned_channels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invites_tgAccountId_key" ON "invites"("tgAccountId");

-- CreateIndex
CREATE INDEX "invite_channels_inviteId_idx" ON "invite_channels"("inviteId");

-- CreateIndex
CREATE UNIQUE INDEX "invite_channels_inviteId_telegramId_key" ON "invite_channels"("inviteId", "telegramId");

-- CreateIndex
CREATE INDEX "invite_recipients_inviteId_idx" ON "invite_recipients"("inviteId");

-- CreateIndex
CREATE INDEX "invite_recipients_inviteId_status_idx" ON "invite_recipients"("inviteId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "invite_recipients_inviteId_userId_key" ON "invite_recipients"("inviteId", "userId");

-- CreateIndex
CREATE INDEX "invite_runs_inviteId_idx" ON "invite_runs"("inviteId");

-- CreateIndex
CREATE INDEX "invite_run_recipients_runId_idx" ON "invite_run_recipients"("runId");

-- CreateIndex
CREATE INDEX "invite_run_recipients_runId_status_idx" ON "invite_run_recipients"("runId", "status");

-- CreateIndex
CREATE INDEX "tg_owned_channels_tgAccountId_idx" ON "tg_owned_channels"("tgAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "tg_owned_channels_tgAccountId_telegramId_key" ON "tg_owned_channels"("tgAccountId", "telegramId");

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_tgAccountId_fkey" FOREIGN KEY ("tgAccountId") REFERENCES "tg_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invite_channels" ADD CONSTRAINT "invite_channels_inviteId_fkey" FOREIGN KEY ("inviteId") REFERENCES "invites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invite_recipients" ADD CONSTRAINT "invite_recipients_inviteId_fkey" FOREIGN KEY ("inviteId") REFERENCES "invites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invite_runs" ADD CONSTRAINT "invite_runs_inviteId_fkey" FOREIGN KEY ("inviteId") REFERENCES "invites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invite_run_recipients" ADD CONSTRAINT "invite_run_recipients_runId_fkey" FOREIGN KEY ("runId") REFERENCES "invite_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tg_owned_channels" ADD CONSTRAINT "tg_owned_channels_tgAccountId_fkey" FOREIGN KEY ("tgAccountId") REFERENCES "tg_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
