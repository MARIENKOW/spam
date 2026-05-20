-- CreateEnum
CREATE TYPE "VideoEntityType" AS ENUM ('BLOG');

-- CreateTable
CREATE TABLE "blogs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "body" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "time" TIME(0) NOT NULL,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "isImportant" BOOLEAN NOT NULL DEFAULT false,
    "isShort" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "imageId" TEXT,

    CONSTRAINT "blogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "entityType" "VideoEntityType" NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blogs_imageId_key" ON "blogs"("imageId");

-- CreateIndex
CREATE INDEX "blogs_isMain_idx" ON "blogs"("isMain");

-- CreateIndex
CREATE INDEX "blogs_isImportant_idx" ON "blogs"("isImportant");

-- CreateIndex
CREATE INDEX "blogs_date_idx" ON "blogs"("date");

-- CreateIndex
CREATE INDEX "Video_entityType_idx" ON "Video"("entityType");

-- AddForeignKey
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
