/*
  Warnings:

  - A unique constraint covering the columns `[previousRefreshTokenHash]` on the table `UserSession` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "UserSession" ADD COLUMN     "previousRefreshTokenHash" TEXT,
ADD COLUMN     "previousTokenExpiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_previousRefreshTokenHash_key" ON "UserSession"("previousRefreshTokenHash");
