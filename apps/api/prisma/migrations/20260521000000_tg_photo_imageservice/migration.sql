-- AlterEnum
ALTER TYPE "FileEntityType" ADD VALUE 'TG_ACCOUNT_PHOTO';

-- AlterTable: replace photoFilename with photoId FK
ALTER TABLE "tg_accounts" DROP COLUMN "photoFilename";
ALTER TABLE "tg_accounts" ADD COLUMN "photoId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "tg_accounts_photoId_key" ON "tg_accounts"("photoId");

-- AddForeignKey
ALTER TABLE "tg_accounts" ADD CONSTRAINT "tg_accounts_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
