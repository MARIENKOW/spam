/*
  Warnings:

  - A unique constraint covering the columns `[imageId]` on the table `Video` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "ImageEntityType" ADD VALUE 'VIDEO';

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "imageId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Video_imageId_key" ON "Video"("imageId");

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
