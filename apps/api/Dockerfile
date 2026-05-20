# syntax=docker/dockerfile:1
# ── Stage 1: builder ────────────────────────────────────────────────────────
FROM node:22-slim AS builder

# bcrypt requires node-gyp (python3/make/g++)
# sharp@0.34+ ships prebuilt binaries — no libvips needed here
RUN apt-get update && apt-get install -y --no-install-recommends \
        python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@11.0.8 --activate

WORKDIR /app

# Copy workspace manifests first for layer-cache on pnpm install
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json        ./apps/api/
COPY apps/web/package.json        ./apps/web/

RUN pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY packages/shared ./packages/shared
COPY apps/api        ./apps/api

# shared has no env dependency — build separately for better layer caching
RUN pnpm --filter=@myorg/shared run build

# .env is mounted as a secret: available only during this RUN, never stored in image layers
RUN --mount=type=secret,id=env,target=/app/.env \
    pnpm --filter=api run build

# Production deploy: prod deps only, @myorg/shared dist is inlined by pnpm
RUN pnpm deploy --filter=api --prod /prod/api


# ── Stage 2: runner ─────────────────────────────────────────────────────────
FROM node:22-slim AS runner

RUN apt-get update && apt-get install -y --no-install-recommends wget openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Production node_modules (includes @myorg/shared dist + prisma CLI we added)
COPY --from=builder /prod/api/node_modules ./node_modules

# Compiled NestJS app (includes dist/src/generated/prisma via nest-cli assets)
COPY --from=builder /app/apps/api/dist ./dist

# Prisma schema directory (multi-file: prisma/models/ + schema.prisma) and migrations
COPY --from=builder /app/apps/api/prisma ./prisma

# prisma.config.ts imports ./src/config which Prisma transpiles internally via esbuild
COPY --from=builder /app/apps/api/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/apps/api/src/config.ts                           ./src/config.ts
COPY --from=builder /app/apps/api/src/infrastructure/hash/hash.service.ts ./src/infrastructure/hash/hash.service.ts

COPY --from=builder /app/apps/api/package.json ./package.json

COPY apps/api/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 5000
ENTRYPOINT ["./entrypoint.sh"]
