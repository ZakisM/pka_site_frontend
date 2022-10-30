FROM node:alpine as build

WORKDIR /pka_site_frontend

RUN npm install -g pnpm

COPY ./package.json ./package.json
COPY ./.swcrc ./.swcrc
COPY ./tsconfig.json ./tsconfig.json
COPY ./pnpm-lock.yaml ./pnpm-lock.yaml
COPY ./public ./public
COPY ./src ./src
COPY ./webpack.common.js ./webpack.common.js
COPY ./webpack.prod.js ./webpack.prod.js

RUN pnpm install
RUN pnpm prod

FROM fholzer/nginx-brotli

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# copy build artifact from previous stage
COPY --from=build /pka_site_frontend/dist /usr/share/nginx/html

CMD ["-g", "daemon off;"]
