apt update
apt upgrade -y
apt install -y daemontools daemontools-run
cd /home/pi/teslacam
npm install
cd src/remote
npm install