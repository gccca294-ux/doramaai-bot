FROM node:22-slim

RUN npm install -g pnpm@10

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY lib/ ./lib/
COPY artifacts/api-server/ ./artifacts/api-server/

RUN pnpm install --frozen-lockfile

RUN pnpm --filter @workspace/api-server run build

RUN mkdir -p /app/data

EXPOSE 8080

ENV PORT=8080
ENV NODE_ENV=production

CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
