-- CreateEnum
CREATE TYPE "TgAccountStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BANNED');

-- CreateTable
CREATE TABLE "tg_accounts" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "sessionString" TEXT NOT NULL,
    "telegramId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "username" TEXT,
    "photoFilename" TEXT,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "status" "TgAccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tg_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tg_accounts_phone_key" ON "tg_accounts"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "tg_accounts_telegramId_key" ON "tg_accounts"("telegramId");

-- CreateIndex
CREATE INDEX "tg_accounts_status_idx" ON "tg_accounts"("status");
