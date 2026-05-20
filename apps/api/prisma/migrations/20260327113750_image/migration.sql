-- CreateEnum
CREATE TYPE "ImageEntityType" AS ENUM ('AVATAR');

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "entityType" "ImageEntityType" NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Image_entityType_idx" ON "Image"("entityType");
