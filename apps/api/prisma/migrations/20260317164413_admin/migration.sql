/*
  Warnings:

  - The `status` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `UserSession` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `resetPasswordToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "StatusAdmin" AS ENUM ('ACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "StatusUser" AS ENUM ('ACTIVE', 'NOACTIVE');

-- DropForeignKey
ALTER TABLE "UserSession" DROP CONSTRAINT "UserSession_userId_fkey";

-- DropForeignKey
ALTER TABLE "resetPasswordToken" DROP CONSTRAINT "resetPasswordToken_userId_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "status",
ADD COLUMN     "status" "StatusUser" NOT NULL DEFAULT 'NOACTIVE';

-- DropTable
DROP TABLE "UserSession";

-- DropTable
DROP TABLE "resetPasswordToken";

-- DropEnum
DROP TYPE "Status";

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "theme" TEXT,
    "locale" TEXT,
    "status" "StatusAdmin" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resetPasswordTokenAdmin" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resetPasswordTokenAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionAdmin" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "userAgent" TEXT,
    "refreshTokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "previousRefreshTokenHash" TEXT,
    "previousTokenExpiresAt" TIMESTAMP(3),
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resetPasswordTokenUser" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resetPasswordTokenUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionUser" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userAgent" TEXT,
    "refreshTokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "previousRefreshTokenHash" TEXT,
    "previousTokenExpiresAt" TIMESTAMP(3),
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "resetPasswordTokenAdmin_adminId_key" ON "resetPasswordTokenAdmin"("adminId");

-- CreateIndex
CREATE INDEX "resetPasswordTokenAdmin_adminId_idx" ON "resetPasswordTokenAdmin"("adminId");

-- CreateIndex
CREATE INDEX "resetPasswordTokenAdmin_expiresAt_idx" ON "resetPasswordTokenAdmin"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "SessionAdmin_refreshTokenHash_key" ON "SessionAdmin"("refreshTokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "SessionAdmin_previousRefreshTokenHash_key" ON "SessionAdmin"("previousRefreshTokenHash");

-- CreateIndex
CREATE INDEX "SessionAdmin_adminId_idx" ON "SessionAdmin"("adminId");

-- CreateIndex
CREATE INDEX "SessionAdmin_refreshTokenHash_idx" ON "SessionAdmin"("refreshTokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "resetPasswordTokenUser_userId_key" ON "resetPasswordTokenUser"("userId");

-- CreateIndex
CREATE INDEX "resetPasswordTokenUser_userId_idx" ON "resetPasswordTokenUser"("userId");

-- CreateIndex
CREATE INDEX "resetPasswordTokenUser_expiresAt_idx" ON "resetPasswordTokenUser"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "SessionUser_refreshTokenHash_key" ON "SessionUser"("refreshTokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "SessionUser_previousRefreshTokenHash_key" ON "SessionUser"("previousRefreshTokenHash");

-- CreateIndex
CREATE INDEX "SessionUser_userId_idx" ON "SessionUser"("userId");

-- CreateIndex
CREATE INDEX "SessionUser_refreshTokenHash_idx" ON "SessionUser"("refreshTokenHash");

-- AddForeignKey
ALTER TABLE "resetPasswordTokenAdmin" ADD CONSTRAINT "resetPasswordTokenAdmin_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionAdmin" ADD CONSTRAINT "SessionAdmin_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resetPasswordTokenUser" ADD CONSTRAINT "resetPasswordTokenUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionUser" ADD CONSTRAINT "SessionUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
