/*
  Warnings:

  - Added the required column `adminId` to the `tg_accounts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tg_accounts" ADD COLUMN     "adminId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "tg_accounts_adminId_idx" ON "tg_accounts"("adminId");

-- AddForeignKey
ALTER TABLE "tg_accounts" ADD CONSTRAINT "tg_accounts_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
