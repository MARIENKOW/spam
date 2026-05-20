/*
  Warnings:

  - You are about to drop the `change_password_codes_user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "change_password_codes_user" DROP CONSTRAINT "change_password_codes_user_userId_fkey";

-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "passwordChangedAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "change_password_codes_user";

-- CreateTable
CREATE TABLE "changePasswordCodeAdmin" (
    "adminId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "newPasswordHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "resendCount" INTEGER NOT NULL DEFAULT 0,
    "lastResendAt" TIMESTAMP(3),
    "blockedAt" TIMESTAMP(3),
    "status" "ChangePasswordCodeStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "changePasswordCodeAdmin_pkey" PRIMARY KEY ("adminId")
);

-- CreateTable
CREATE TABLE "changePasswordCodeUser" (
    "userId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "newPasswordHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "resendCount" INTEGER NOT NULL DEFAULT 0,
    "lastResendAt" TIMESTAMP(3),
    "blockedAt" TIMESTAMP(3),
    "status" "ChangePasswordCodeStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "changePasswordCodeUser_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "changePasswordCodeAdmin" ADD CONSTRAINT "changePasswordCodeAdmin_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "changePasswordCodeUser" ADD CONSTRAINT "changePasswordCodeUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
