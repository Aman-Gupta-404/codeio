# ---------------------------------------------------
# Stage 1: Prune workspace
# ---------------------------------------------------

FROM node:22-alpine AS pruner

WORKDIR /app

RUN corepack enable

COPY . .

RUN pnpm dlx turbo prune codeio-frontend --docker


# ---------------------------------------------------
# Stage 2: Install dependencies + build
# ---------------------------------------------------

FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable

ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

RUN echo "Clerk publishable key configured: ${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:+yes}"

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

COPY --from=builder /app/apps/codeio-frontend/.next/standalone ./
COPY --from=builder /app/apps/codeio-frontend/.next/static ./apps/codeio-frontend/.next/static
COPY --from=builder /app/apps/codeio-frontend/public ./apps/codeio-frontend/public

EXPOSE 3000

CMD ["node", "apps/codeio-frontend/server.js"]
# CMD ["pnpm", "--filter", "codeio-frontend", "start"]
# |__> we are using standalone output of next js, thats why not using above command
