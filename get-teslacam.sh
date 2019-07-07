#!/bin/sh
set -e

echo "Installing TeslaCam"

install() {
    curl -fsSL get.docker.com | VERSION=18.06.* sh

    mkdir -p ~/teslacam/video
    mkdir -p ~/teslacam/.images
    mkdir -p ~/teslacam/.etc/ssh

    sudo docker run \
    --rm \
    -it \
    -v ~/teslacam/.etc/ssh:/root/.ssh \
    --entrypoint "ssh-keygen" \
    teslacam/dashcam-monitor \
    -f /root/.ssh/id_rsa -q -N ""

    sudo docker run \
    --rm \
    -it \
    -v ~/teslacam/.etc/ssh:/root/.ssh \
    --entrypoint "ssh-copy-id" \
    teslacam/dashcam-monitor \
    pi@172.17.0.1

    echo "Installing Docker Compose"
    sudo apt-get -y install docker-compose

    echo "Installing and starting services"
    curl -fsSL https://raw.githubusercontent.com/wurmr/teslacam/feature/containerize-dashcam-monitor/docker-compose.yml | sudo docker-compose -f - -p teslacam up -d
}

install
