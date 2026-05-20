-- CreateTable
CREATE TABLE "activateToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activateToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "activateToken_userId_key" ON "activateToken"("userId");

-- CreateIndex
CREATE INDEX "activateToken_userId_idx" ON "activateToken"("userId");

-- CreateIndex
CREATE INDEX "activateToken_expiresAt_idx" ON "activateToken"("expiresAt");

-- AddForeignKey
ALTER TABLE "activateToken" ADD CONSTRAINT "activateToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
