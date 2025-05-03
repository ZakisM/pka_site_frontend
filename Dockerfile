FROM rust:latest AS wasm-build

WORKDIR /wasm

RUN apt update && \
    apt install clang llvm -y && \
    curl -L --proto '=https' --tlsv1.2 -sSf https://raw.githubusercontent.com/cargo-bins/cargo-binstall/main/install-from-binstall-release.sh | bash

RUN cargo binstall wasm-bindgen-cli just -y
RUN rustup target add wasm32-unknown-unknown

COPY justfile .
COPY /lib_wasm ./lib_wasm

RUN just update-wasm-bindgen

FROM oven/bun:1 AS build

WORKDIR /pka_site_frontend

COPY package.json .
COPY bun.lock .
COPY index.html .
COPY vite.config.ts .
COPY /public ./public
COPY /src ./src

COPY --from=wasm-build /wasm/src ./src/lib_wasm_out

RUN bun install
RUN bun run build

FROM fholzer/nginx-brotli

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /pka_site_frontend/dist /usr/share/nginx/html

CMD ["-g", "daemon off;"]
