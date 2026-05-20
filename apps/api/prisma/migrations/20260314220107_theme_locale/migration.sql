/*
  Warnings:

  - Added the required column `expiresAt` to the `UserSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserSession" ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "locale" TEXT,
ADD COLUMN     "theme" TEXT;
