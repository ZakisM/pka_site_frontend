FROM rust:latest as wasm-build

RUN apt update && \
    apt install clang llvm -y && \
    curl -L --proto '=https' --tlsv1.2 -sSf https://raw.githubusercontent.com/cargo-bins/cargo-binstall/main/install-from-binstall-release.sh | bash

RUN cargo binstall wasm-bindgen-cli wasm-opt just -y
RUN rustup target add wasm32-unknown-unknown

COPY justfile .
COPY /lib_wasm ./lib_wasm

RUN just wasm-opt

FROM node:current-alpine as build

WORKDIR /pka_site_frontend

RUN npm install -g pnpm

COPY package.json .
COPY /.swcrc /.swcrc
COPY tsconfig.json .
COPY pnpm-lock.yaml .
COPY webpack.common.js .
COPY webpack.prod.js .
COPY /public ./public
COPY /src ./src
COPY --from=wasm-build /lib_wasm/lib_wasm_out ./src/lib_wasm_out

RUN pnpm install
RUN pnpm build:prod

FROM fholzer/nginx-brotli

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /pka_site_frontend/dist /usr/share/nginx/html

CMD ["-g", "daemon off;"]
