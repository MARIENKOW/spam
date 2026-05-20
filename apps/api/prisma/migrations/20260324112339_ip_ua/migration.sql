/*
  Warnings:

  - Made the column `userAgent` on table `SessionUser` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ip` on table `SessionUser` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "SessionUser" ALTER COLUMN "userAgent" SET NOT NULL,
ALTER COLUMN "ip" SET NOT NULL;
