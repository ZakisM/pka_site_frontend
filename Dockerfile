# The Vite+ toolchain image. `vp` reads .node-version and package.json's
# packageManager, so the image is built with the same Node and pnpm as CI.
FROM ghcr.io/voidzero-dev/vite-plus:1 AS build

# Owned by the image's non-root `vp` user, as everything copied in must be.
WORKDIR /app

# Dependencies first: this layer is reused until one of these files changes.
COPY --chown=vp:vp package.json pnpm-lock.yaml pnpm-workspace.yaml .node-version ./
RUN vp install --frozen-lockfile

COPY --chown=vp:vp index.html vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY --chown=vp:vp public ./public
COPY --chown=vp:vp src ./src
RUN vp build

# NGINX's own build of its image that runs as its `nginx` user (uid 101), not
# root: it listens on 5678, which needs no root to bind.
FROM nginxinc/nginx-unprivileged:stable-alpine

# Alpine's security fixes land between nginx's own image releases, so take them
# on every build: as root for this step alone.
USER root
RUN apk upgrade --no-cache
USER 101

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY ./security-headers.conf /etc/nginx/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html
