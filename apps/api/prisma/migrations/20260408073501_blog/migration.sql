/*
  Warnings:

  - Made the column `imageId` on table `blogs` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "FileEntityType" ADD VALUE 'BLOG_MAIN_IMAGE';

-- DropForeignKey
ALTER TABLE "blogs" DROP CONSTRAINT "blogs_imageId_fkey";

-- AlterTable
ALTER TABLE "blogs" ALTER COLUMN "imageId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
