/*
  Warnings:

  - The values [BLOG_UPLOAD_VIDEO,BLOG_UPLOAD_IMAGE,BLOG_IN_VIDEO,BLOG_IN_IMAGE] on the enum `FileEntityType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FileEntityType_new" AS ENUM ('BLOG_VIDEO', 'BLOG_IMAGE', 'AVATAR');
ALTER TABLE "Image" ALTER COLUMN "entityType" TYPE "FileEntityType_new" USING ("entityType"::text::"FileEntityType_new");
ALTER TABLE "Video" ALTER COLUMN "entityType" TYPE "FileEntityType_new" USING ("entityType"::text::"FileEntityType_new");
ALTER TYPE "FileEntityType" RENAME TO "FileEntityType_old";
ALTER TYPE "FileEntityType_new" RENAME TO "FileEntityType";
DROP TYPE "public"."FileEntityType_old";
COMMIT;
