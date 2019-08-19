
# Update the pi to the latest dependencies
apt update
apt upgrade -y

# Install daemon tools to keep the scripts alive
apt install -y daemontools daemontools-run git

# Setup the teslacam folder and make sure everything is installed.

ln -s /opt/node/bin/* /usr/bin
chown -R pi:pi /home/pi/teslacam
cd /home/pi/teslacam
git pull #
npm install
cd src/remote
npm install