FROM ubuntu as builder
RUN apt-get update
RUN apt-get install -y curl wget
WORKDIR /builder/qemu 
RUN curl -L https://github.com/balena-io/qemu/releases/download/v3.0.0%2Bresin/qemu-3.0.0+resin-arm.tar.gz | tar zxvf - -C . && mv qemu-3.0.0+resin-arm/qemu-arm-static .

FROM arm32v6/node:lts-alpine
COPY --from=builder /builder/qemu/qemu-arm-static /usr/bin
RUN apk add --update --no-cache openssh
WORKDIR /usr/local/teslacam
COPY package.json .
COPY yarn.lock .
RUN yarn --production
COPY . .
VOLUME ["/root/.ssh"]
VOLUME ["/home/pi/teslacam/video"]
ENTRYPOINT ["node", "./src/dashcam-monitor"]