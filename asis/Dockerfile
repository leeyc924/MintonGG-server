FROM node:18.18.2 AS base

RUN mkdir -p /app
RUN npm install -g pnpm

WORKDIR /app

COPY . .

RUN \
  if [ -f pnpm-lock.yaml ]; then pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi
RUN pnpm install

ENV PORT 3000
EXPOSE 3000

ENTRYPOINT [ "sh", "-c", "pnpm start" ]