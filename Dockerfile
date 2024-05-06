FROM node:20-alpine AS base

RUN yarn config set strict-ssl false && yarn global add pnpm

FROM base AS builder
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY . .

RUN pnpm install
RUN pnpm build

FROM base AS runner

WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json .

EXPOSE 3000

ENV PORT 3000

ENTRYPOINT [ "sh", "-c", "node ./dist/src/main.js" ]