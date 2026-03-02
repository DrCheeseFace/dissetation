FROM node:20-slim AS base

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

ENV PATH /app/node_modules/.bin:$PATH

RUN pnpm install --frozen-lockfile

COPY . ./

EXPOSE 5173 

CMD ["pnpm", "run", "dev"]
