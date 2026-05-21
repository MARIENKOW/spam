-- Add channelsSnapshot to BroadcastRun
ALTER TABLE "broadcast_runs" ADD COLUMN "channelsSnapshot" JSONB NOT NULL DEFAULT '[]';

-- Create BroadcastRunRecipient table
CREATE TABLE "broadcast_run_recipients" (
    "id"           TEXT NOT NULL,
    "runId"        TEXT NOT NULL,
    "userId"       TEXT NOT NULL,
    "username"     TEXT,
    "firstName"    TEXT,
    "lastName"     TEXT,
    "status"       "RecipientStatus" NOT NULL,
    "errorMessage" TEXT,
    "sentAt"       TIMESTAMP(3),

    CONSTRAINT "broadcast_run_recipients_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "broadcast_run_recipients_runId_idx" ON "broadcast_run_recipients"("runId");
CREATE INDEX "broadcast_run_recipients_runId_status_idx" ON "broadcast_run_recipients"("runId", "status");

-- Foreign key
ALTER TABLE "broadcast_run_recipients" ADD CONSTRAINT "broadcast_run_recipients_runId_fkey"
    FOREIGN KEY ("runId") REFERENCES "broadcast_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
