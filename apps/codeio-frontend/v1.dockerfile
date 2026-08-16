# Initial version without the standalone option in next config


# ---------------------------------------------------
# Stage 1: Prune workspace
# ---------------------------------------------------

FROM node:22-alpine AS pruner

WORKDIR /app

RUN corepack enable

COPY . .

RUN pnpm dlx turbo prune codeio-frontend --docker


# ---------------------------------------------------
# Stage 2: Install dependencies
# ---------------------------------------------------

FROM node:22-alpine AS installer

WORKDIR /app

RUN corepack enable

COPY --from=pruner /app/out/json/ .

RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

RUN pnpm turbo run build --filter=codeio-frontend...


# ---------------------------------------------------
# Stage 3: Runtime
# ---------------------------------------------------

FROM node:22-alpine AS runner

WORKDIR /app

RUN corepack enable

ENV NODE_ENV=production

COPY --from=installer /app .

EXPOSE 3000

CMD ["pnpm", "--filter", "codeio-frontend", "start"]