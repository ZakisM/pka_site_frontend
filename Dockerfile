FROM node:alpine as build

WORKDIR /pka_site_frontend

COPY ./package.json ./package.json
COPY ./tsconfig.json ./tsconfig.json
COPY ./yarn.lock ./yarn.lock
COPY ./public ./public
COPY ./src ./src

RUN yarn install
RUN yarn build

FROM nginx:alpine

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# copy build artifact from previous stage
COPY --from=build /pka_site_frontend/build /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
