FROM node:alpine as build

WORKDIR /pka_site_frontend

COPY ./package.json ./package.json
COPY ./tsconfig.json ./tsconfig.json
COPY ./yarn.lock ./yarn.lock
COPY ./public ./public
COPY ./src ./src
COPY ./webpack.common.js ./webpack.common.js
COPY ./webpack.prod.js ./webpack.prod.js

RUN yarn install
RUN yarn prod

FROM fholzer/nginx-brotli

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# copy build artifact from previous stage
COPY --from=build /pka_site_frontend/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
