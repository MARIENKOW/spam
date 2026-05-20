/*
  Warnings:

  - Changed the type of `entityType` on the `Image` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `entityType` on the `Video` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('BLOG', 'AVATAR');

-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "path" TEXT,
DROP COLUMN "entityType",
ADD COLUMN     "entityType" "EntityType" NOT NULL;

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "path" TEXT,
DROP COLUMN "entityType",
ADD COLUMN     "entityType" "EntityType" NOT NULL;

-- DropEnum
DROP TYPE "ImageEntityType";

-- DropEnum
DROP TYPE "VideoEntityType";

-- CreateIndex
CREATE INDEX "Image_entityType_idx" ON "Image"("entityType");

-- CreateIndex
CREATE INDEX "Video_entityType_idx" ON "Video"("entityType");
