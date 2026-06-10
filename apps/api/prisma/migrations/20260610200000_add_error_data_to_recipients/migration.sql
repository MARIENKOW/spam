-- AlterTable
ALTER TABLE "invite_recipients" ADD COLUMN "errorData" JSONB;

-- AlterTable
ALTER TABLE "invite_run_recipients" ADD COLUMN "errorData" JSONB;
