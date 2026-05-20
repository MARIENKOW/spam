-- Add publishedAt with default from existing date+time columns, then drop them
ALTER TABLE "blogs" ADD COLUMN "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW();

-- Populate from existing data (combine date and time into one timestamp)
UPDATE "blogs" SET "publishedAt" = (date::date + time::time)::timestamp;

-- Remove the default constraint (column is now required without default)
ALTER TABLE "blogs" ALTER COLUMN "publishedAt" DROP DEFAULT;

-- Drop old columns
ALTER TABLE "blogs" DROP COLUMN "date";
ALTER TABLE "blogs" DROP COLUMN "time";

-- Drop old index and create new one
DROP INDEX IF EXISTS "blogs_date_idx";
CREATE INDEX "blogs_publishedAt_idx" ON "blogs"("publishedAt");
