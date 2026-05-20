#!/bin/sh
set -e

echo "[entrypoint] Applying database migrations..."
node node_modules/prisma/build/index.js migrate deploy

echo "[entrypoint] Regenerating Prisma client (safety check)..."
node node_modules/prisma/build/index.js generate
# The schema output is ../src/generated/prisma (relative to prisma/ dir).
# Copy to dist so the compiled app picks up the latest client.
cp -r src/generated/prisma/. dist/src/generated/prisma/ 2>/dev/null || true

echo "[entrypoint] Starting application..."
exec node dist/src/main
