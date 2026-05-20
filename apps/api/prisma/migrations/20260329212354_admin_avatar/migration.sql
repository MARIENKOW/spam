/*
  Warnings:

  - You are about to drop the column `avatarUrl` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[avatarId]` on the table `admins` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "avatarId" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "avatarUrl";

-- CreateIndex
CREATE UNIQUE INDEX "admins_avatarId_key" ON "admins"("avatarId");

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
