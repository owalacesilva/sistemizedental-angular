# syntax=docker/dockerfile:1

###############################################################################
# Base — pinned to the Node major Angular 22 supports (see .nvmrc / engines).
###############################################################################
FROM node:22-alpine AS base
WORKDIR /app
ENV CI=true

###############################################################################
# Dependencies — cached independently of application source.
###############################################################################
FROM base AS deps
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

###############################################################################
# Development — `ng serve` with hot reload, used by docker compose.
###############################################################################
FROM base AS development
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 4200
CMD ["npm", "run", "start", "--", "--host", "0.0.0.0", "--port", "4200", "--poll", "1000"]

###############################################################################
# Build — produces the optimized browser bundle.
###############################################################################
FROM deps AS build
COPY . .
RUN npm run build

###############################################################################
# Test — lint + unit tests, for CI (`docker build --target test .`).
###############################################################################
FROM deps AS test
COPY . .
RUN npm run lint && npm run test:ci

###############################################################################
# Production — static bundle served by nginx.
###############################################################################
FROM nginx:1.27-alpine AS production
RUN rm -rf /usr/share/nginx/html/*
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
# Kept out of conf.d/ — nginx auto-includes conf.d/*.conf at the http level.
COPY docker/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/dist/sistemizedental/browser /usr/share/nginx/html

# Run unprivileged: nginx:alpine ships an `nginx` user we can hand the runtime dirs to.
RUN touch /var/run/nginx.pid \
  && chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /usr/share/nginx/html
USER nginx

EXPOSE 8080
# 127.0.0.1, not localhost: busybox resolves localhost to ::1 first and nginx
# listens on IPv4 only, which makes the probe fail with "connection refused".
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
