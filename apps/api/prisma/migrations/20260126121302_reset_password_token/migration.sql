-- CreateTable
CREATE TABLE "resetPasswordToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resetPasswordToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "resetPasswordToken_userId_key" ON "resetPasswordToken"("userId");

-- CreateIndex
CREATE INDEX "resetPasswordToken_userId_idx" ON "resetPasswordToken"("userId");

-- CreateIndex
CREATE INDEX "resetPasswordToken_expiresAt_idx" ON "resetPasswordToken"("expiresAt");

-- AddForeignKey
ALTER TABLE "resetPasswordToken" ADD CONSTRAINT "resetPasswordToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
