/*
  Warnings:

  - Changed the type of `entityType` on the `Image` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `entityType` on the `Video` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "FileEntityType" AS ENUM ('BLOG_UPLOAD_VIDEO', 'BLOG_UPLOAD_IMAGE', 'BLOG_IN_VIDEO', 'BLOG_IN_IMAGE', 'AVATAR');

-- AlterTable
ALTER TABLE "Image" DROP COLUMN "entityType",
ADD COLUMN     "entityType" "FileEntityType" NOT NULL;

-- AlterTable
ALTER TABLE "Video" DROP COLUMN "entityType",
ADD COLUMN     "entityType" "FileEntityType" NOT NULL;

-- DropEnum
DROP TYPE "EntityType";

-- CreateIndex
CREATE INDEX "Image_entityType_idx" ON "Image"("entityType");

-- CreateIndex
CREATE INDEX "Video_entityType_idx" ON "Video"("entityType");
