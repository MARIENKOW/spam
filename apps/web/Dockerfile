# syntax=docker/dockerfile:1
# ── Stage 1: builder ────────────────────────────────────────────────────────
FROM node:22-slim AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@11.0.8 --activate

RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy workspace manifests first for layer-cache on pnpm install
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json        ./apps/api/
COPY apps/web/package.json        ./apps/web/

RUN pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY packages/shared ./packages/shared
COPY apps/web        ./apps/web

# shared has no env dependency — build separately for better layer caching
RUN pnpm --filter=@myorg/shared run build

# .env is mounted as a secret: available only during this RUN, never stored in image layers.
RUN --mount=type=secret,id=env,target=/app/.env \
    pnpm --filter=web run build

# Ensure public/ exists so the runner COPY never fails on empty/missing folder
RUN mkdir -p /app/apps/web/public

# Production deploy: prod deps only, @myorg/shared dist is inlined by pnpm
RUN pnpm deploy --filter=web --prod /prod/web

# ── Stage 2: runner ─────────────────────────────────────────────────────────
FROM node:22-slim AS runner

RUN apt-get update && apt-get install -y --no-install-recommends wget \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Production node_modules (includes next, next-intl, dotenv, @myorg/shared, etc.)
COPY --from=builder /prod/web/node_modules ./node_modules

# Pre-built Next.js application
COPY --from=builder /app/apps/web/.next ./.next

# next.config.ts is evaluated by `next start` — Next.js handles TS natively
COPY --from=builder /app/apps/web/next.config.ts ./next.config.ts

COPY --from=builder /app/apps/web/public ./public

COPY --from=builder /app/apps/web/package.json ./package.json

EXPOSE 3000

CMD ["node_modules/.bin/next", "start"]
