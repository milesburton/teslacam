FROM node:lts-alpine
RUN apk add --update --no-cache openssh rsync
WORKDIR /usr/local/teslacam
COPY package.json .
COPY yarn.lock .
RUN yarn --production
COPY . .
VOLUME ["/root/.ssh"]
VOLUME ["/home/pi/teslacam/video"]
VOLUME ["/mnt"]
ENTRYPOINT ["node", "./src/dashcam-monitor"]