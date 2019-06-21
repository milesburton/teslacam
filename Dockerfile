FROM node:lts-alpine
RUN apk add --update --no-cache openssh rsync
WORKDIR /usr/local/teslacam
COPY . .
RUN yarn --production
VOLUME ["/root/.ssh"]
VOLUME ["/home/pi/teslacam/video"]
VOLUmE ["/home/pi/teslacam/images"]