# ---------------------------------------------------
# Stage 1: Prune workspace
# ---------------------------------------------------
FROM node:22-alpine AS pruner

WORKDIR /app

RUN corepack enable

COPY . .

RUN pnpm dlx turbo prune codeio-workspace-gateway --docker


# ---------------------------------------------------
# Stage 2: Install dependencies
# ---------------------------------------------------
FROM node:22-alpine AS installer

WORKDIR /app

RUN corepack enable

COPY --from=pruner /app/out/json/ .

RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

RUN pnpm turbo run build --filter=codeio-workspace-gateway...


# ---------------------------------------------------
# Stage 3: Runtime image
# ---------------------------------------------------
FROM node:22-alpine

WORKDIR /app

RUN corepack enable

COPY --from=installer /app .

EXPOSE 3000

CMD ["pnpm", "--filter", "codeio-workspace-gateway", "start"]