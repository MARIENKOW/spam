/*
  Warnings:

  - Made the column `lastUsedAt` on table `sessions` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "sessions" ALTER COLUMN "lastUsedAt" SET NOT NULL;
