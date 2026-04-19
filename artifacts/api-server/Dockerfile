FROM node:22-alpine

WORKDIR /app

COPY package.json ./
COPY . .

RUN corepack enable && pnpm install --no-frozen-lockfile
RUN pnpm run build

EXPOSE 4000

CMD ["pnpm", "start"]
