FROM node:20-bookworm-slim AS base

RUN apt-get update \
	&& apt-get install -y --no-install-recommends openssl ca-certificates \
	&& rm -rf /var/lib/apt/lists/*

# Trust the corporate proxy (Zscaler/Kainos TLS inspection) root/intermediate CAs
# so builds work behind the corporate proxy without disabling TLS verification.
COPY docker/certs/*.crt /usr/local/share/ca-certificates/
RUN update-ca-certificates

ENV NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt

FROM base AS deps

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

FROM base AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/package-lock.json ./package-lock.json
COPY --from=deps /app/prisma ./prisma

COPY tsconfig.json ./
COPY src ./src

RUN npm run build && npm prune --omit=dev

FROM gcr.io/distroless/nodejs20-debian12 AS runtime

WORKDIR /app

# Distroless provides uid/gid 65532 (nonroot).
USER 65532:65532

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=build --chown=65532:65532 /app/package.json ./package.json
COPY --from=build --chown=65532:65532 /app/node_modules ./node_modules
COPY --from=build --chown=65532:65532 /app/prisma ./prisma
COPY --from=build --chown=65532:65532 /app/dist ./dist

EXPOSE 3001

CMD ["dist/index.js"]