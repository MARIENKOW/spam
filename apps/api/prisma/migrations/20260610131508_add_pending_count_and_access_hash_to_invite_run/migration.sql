-- AlterTable
ALTER TABLE "invite_run_recipients" ADD COLUMN     "accessHash" TEXT;

-- AlterTable
ALTER TABLE "invite_runs" ADD COLUMN     "pendingCount" INTEGER NOT NULL DEFAULT 0;
