-- AlterEnum
ALTER TYPE "RunStatus" ADD VALUE 'RUNNING';

-- AlterTable
ALTER TABLE "invite_runs" ALTER COLUMN "finishedAt" DROP NOT NULL,
ALTER COLUMN "finishedAt" DROP DEFAULT;
