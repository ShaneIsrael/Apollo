FROM node:16.13-alpine3.13

RUN apk add --update --no-cache \
  make \
  g++ \
  automake \
  autoconf \
  libtool \
  nasm \
  libjpeg-turbo-dev

RUN mkdir /data
COPY ui/src /ui/src
COPY ui/public /ui/public
COPY ui/package.json /ui

COPY server/src /server/src
COPY server/.sequelizerc /server
COPY server/package.json /server
COPY server/config.default.json /data
COPY entrypoint.sh /entrypoint.sh

RUN chmod +x entrypoint.sh

WORKDIR /ui
RUN npm i
RUN npm run build

RUN rm -r src/
RUN rm -r node_modules/
RUN rm -r public/
RUN rm *.json

WORKDIR /server
RUN npm i --silent

EXPOSE 3000
ENTRYPOINT ["/entrypoint.sh"]
