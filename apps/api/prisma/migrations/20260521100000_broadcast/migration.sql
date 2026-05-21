-- CreateEnum
CREATE TYPE "BroadcastStatus" AS ENUM ('DRAFT', 'RUNNING', 'COMPLETED', 'STOPPED');

-- CreateEnum
CREATE TYPE "RecipientStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "RunStatus" AS ENUM ('COMPLETED', 'STOPPED');

-- CreateTable
CREATE TABLE "broadcasts" (
    "id" TEXT NOT NULL,
    "tgAccountId" TEXT NOT NULL,
    "message" TEXT NOT NULL DEFAULT '',
    "status" "BroadcastStatus" NOT NULL DEFAULT 'DRAFT',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "broadcasts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "broadcast_channels" (
    "id" TEXT NOT NULL,
    "broadcastId" TEXT NOT NULL,
    "telegramId" TEXT NOT NULL,
    "username" TEXT,
    "title" TEXT NOT NULL,
    "photoUrl" TEXT,
    "memberCount" INTEGER,
    "recipientCount" INTEGER,

    CONSTRAINT "broadcast_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "broadcast_recipients" (
    "id" TEXT NOT NULL,
    "broadcastId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "status" "RecipientStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "broadcast_recipients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "broadcast_runs" (
    "id" TEXT NOT NULL,
    "broadcastId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "RunStatus" NOT NULL,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "totalCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "broadcast_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "broadcasts_tgAccountId_key" ON "broadcasts"("tgAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "broadcast_channels_broadcastId_telegramId_key" ON "broadcast_channels"("broadcastId", "telegramId");

-- CreateIndex
CREATE INDEX "broadcast_channels_broadcastId_idx" ON "broadcast_channels"("broadcastId");

-- CreateIndex
CREATE UNIQUE INDEX "broadcast_recipients_broadcastId_userId_key" ON "broadcast_recipients"("broadcastId", "userId");

-- CreateIndex
CREATE INDEX "broadcast_recipients_broadcastId_idx" ON "broadcast_recipients"("broadcastId");

-- CreateIndex
CREATE INDEX "broadcast_recipients_broadcastId_status_idx" ON "broadcast_recipients"("broadcastId", "status");

-- CreateIndex
CREATE INDEX "broadcast_runs_broadcastId_idx" ON "broadcast_runs"("broadcastId");

-- AddForeignKey
ALTER TABLE "broadcasts" ADD CONSTRAINT "broadcasts_tgAccountId_fkey" FOREIGN KEY ("tgAccountId") REFERENCES "tg_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "broadcast_channels" ADD CONSTRAINT "broadcast_channels_broadcastId_fkey" FOREIGN KEY ("broadcastId") REFERENCES "broadcasts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "broadcast_recipients" ADD CONSTRAINT "broadcast_recipients_broadcastId_fkey" FOREIGN KEY ("broadcastId") REFERENCES "broadcasts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "broadcast_runs" ADD CONSTRAINT "broadcast_runs_broadcastId_fkey" FOREIGN KEY ("broadcastId") REFERENCES "broadcasts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
