FROM node:23-slim AS base

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

ENV PATH /app/node_modules/.bin:$PATH

ENV NPM_CONFIG_ALLOWED_BUILD_SCRIPTS=esbuild,msw

RUN pnpm config set allowed-build-scripts esbuild,msw && pnpm install --frozen-lockfile

COPY . ./

EXPOSE 5173 

CMD ["pnpm", "run", "dev"]
