-- AlterTable
ALTER TABLE "broadcast_recipients" ADD COLUMN "errorData" JSONB;

-- AlterTable
ALTER TABLE "broadcast_run_recipients" ADD COLUMN "accessHash" TEXT;
ALTER TABLE "broadcast_run_recipients" ADD COLUMN "errorData" JSONB;

-- AlterTable
ALTER TABLE "broadcast_runs" ADD COLUMN "pendingCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "broadcast_runs" ALTER COLUMN "finishedAt" DROP NOT NULL;
ALTER TABLE "broadcast_runs" ALTER COLUMN "finishedAt" DROP DEFAULT;
