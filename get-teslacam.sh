#!/bin/sh
set -e

echo "Installing TeslaCam"

install() {
    # Lock to docker-ce 18.06
    curl -fsSL get.docker.com | VERSION=18.06.* sh
    # adding local user to docker group
    sudo usermod -aG docker $USER

    mkdir -p ~/teslacam/video
    mkdir -p ~/teslacam/.images

    sudo -u $USER \
    docker run \
    --rm \
    -v teslacam_ssh:/root/.ssh \
    --entrypoint "ssh-keygen" \
    teslacam/dashcam-monitor \
    -f /root/.ssh/id_rsa -q -N ""

    sudo -u $USER \
    docker run \
    --rm \
    -it \
    -v teslacam_ssh:/root/.ssh \
    --entrypoint "ssh-copy-id" \
    teslacam/dashcam-monitor \
    pi@172.17.0.1

    echo "Installing Dashcam Monitor"
    sudo -u $USER \
    docker run \
    --restart=always \
    -d \
    -v teslacam_ssh:/root/.ssh \
    -v ~/teslacam/video:/home/pi/teslacam/video \
    -v /mnt:/mnt \
    -e "USE_SSH=true" \
    -e "IMAGE_SIZE_MB=3072" \
    -e "IMAGE_DIR=~/teslacam/.images" \
    -e "BACKUP_DIR=~/teslacam/video" \
    --name dashcam-monitor \
    teslacam/dashcam-monitor

    echo "Installing Clip Cleaner"
    sudo -u $USER \
    docker run \
    --restart=always \
    -d \
    -v /home/pi/teslacam/video:/video \
    -e "NUMBER_OF_DAYS_TO_KEEP=2" \
    --name clean-recent-clips \
    teslacam/clean-recent-clips
}

install
