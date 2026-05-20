-- AlterEnum
BEGIN;
CREATE TYPE "ChangePasswordCodeStatus_new" AS ENUM ('PENDING', 'BLOCKED', 'SUCCESS');
ALTER TABLE "changePasswordCodeUser" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "changePasswordCodeUser" ALTER COLUMN "status" TYPE "ChangePasswordCodeStatus_new" USING ("status"::text::"ChangePasswordCodeStatus_new");
ALTER TYPE "ChangePasswordCodeStatus" RENAME TO "ChangePasswordCodeStatus_old";
ALTER TYPE "ChangePasswordCodeStatus_new" RENAME TO "ChangePasswordCodeStatus";
DROP TYPE "ChangePasswordCodeStatus_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "changePasswordCodeUser" DROP CONSTRAINT "changePasswordCodeUser_userId_fkey";

-- DropTable
DROP TABLE "changePasswordCodeUser";

-- CreateTable
CREATE TABLE "change_password_codes_user" (
    "userId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "newPasswordHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "resendCount" INTEGER NOT NULL DEFAULT 0,
    "lastResendAt" TIMESTAMP(3),
    "blockedAt" TIMESTAMP(3),
    "status" "ChangePasswordCodeStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "change_password_codes_user_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "change_password_codes_user" ADD CONSTRAINT "change_password_codes_user_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;