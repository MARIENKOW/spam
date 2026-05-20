-- CreateEnum
CREATE TYPE "ChangePasswordCodeStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED', 'BLOCKED');

-- CreateTable
CREATE TABLE "changePasswordCodeUser" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "newPasswordHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "blockedAt" TIMESTAMP(3),
    "resendCount" INTEGER NOT NULL DEFAULT 0,
    "lastResendAt" TIMESTAMP(3),
    "status" "ChangePasswordCodeStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "changePasswordCodeUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "changePasswordCodeUser_userId_status_idx" ON "changePasswordCodeUser"("userId", "status");

-- CreateIndex
CREATE INDEX "changePasswordCodeUser_expiresAt_idx" ON "changePasswordCodeUser"("expiresAt");

-- AddForeignKey
ALTER TABLE "changePasswordCodeUser" ADD CONSTRAINT "changePasswordCodeUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
