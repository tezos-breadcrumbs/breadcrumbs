FROM docker.io/node:16-alpine

RUN apk add python3 make gcc musl-dev pkgconfig libusb-dev g++ linux-headers eudev-dev

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENTRYPOINT [ "npm", "run", "pay", "--", "--confirm" ]
