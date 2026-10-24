FROM oven/bun:1 AS build

WORKDIR /pka_site_frontend

COPY package.json .
COPY bun.lock .
COPY index.html .
COPY vite.config.ts .
COPY /public ./public
COPY /src ./src

RUN bun install --frozen-lockfile
RUN bun run build

# nginx publishes no Brotli module package, only its build recipe (pkg-oss), so
# it's built here against the exact nginx release in the image. These are the
# steps of nginx's own modules/Dockerfile.alpine (github.com/nginx/docker-nginx),
# cut down to Brotli. The module links Alpine's brotli-libs, so Alpine's fixes
# to Brotli reach it through the final stage's upgrade.
FROM nginx:stable-alpine AS brotli

SHELL ["/bin/ash", "-exo", "pipefail", "-c"]

RUN apk add --no-cache abuild coreutils curl g++ gcc git libxml2-utils libxslt linux-headers \
        make musl-dev openssl openssl-dev pcre2-dev unzip xz zlib-dev \
    # abuild refuses to run as root without -F
    && printf '#!/bin/sh\nSETFATTR=true /usr/bin/abuild -F "$@"\n' > /usr/local/bin/abuild \
    && chmod +x /usr/local/bin/abuild \
    && git clone --depth 1 -b "$NGINX_VERSION-$PKG_RELEASE" https://github.com/nginx/pkg-oss /pkg-oss \
    && cd /pkg-oss/alpine \
    && make abuild-module-brotli BASE_VERSION="$NGINX_VERSION" NGINX_VERSION="$NGINX_VERSION" \
    && apk add --no-cache $(. ./abuild-module-brotli/APKBUILD; echo $makedepends) \
    && make module-brotli BASE_VERSION="$NGINX_VERSION" NGINX_VERSION="$NGINX_VERSION" \
    && mkdir /packages \
    && find ~/packages -name "nginx-module-brotli-$NGINX_VERSION*.apk" -exec mv {} /packages/ \;

FROM nginx:stable-alpine

# Alpine's security fixes land between nginx's own image releases, so take them
# on every build
RUN --mount=type=bind,from=brotli,source=/packages,target=/packages \
    apk add --no-cache --allow-untrusted /packages/*.apk \
    && apk upgrade --no-cache \
    && sed -i -e '1i load_module modules/ngx_http_brotli_filter_module.so;' \
        -e '1i load_module modules/ngx_http_brotli_static_module.so;' /etc/nginx/nginx.conf

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /pka_site_frontend/dist /usr/share/nginx/html
