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

FROM fholzer/nginx-brotli

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /pka_site_frontend/dist /usr/share/nginx/html

CMD ["-g", "daemon off;"]
