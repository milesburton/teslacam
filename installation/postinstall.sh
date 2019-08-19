
# The purpose of the post install is to clean up any final installation steps that could not be (easily) done when the disk image was being baked


# Update the pi to the latest dependencies
apt update
apt upgrade -y

# Install daemon tools to keep the scripts alive
apt install -y daemontools daemontools-run git

# Symlink node so it is on the $PATH
ln -s /opt/node/bin/* /usr/bin

# Setup the teslacam folder and make sure everything is installed.
chown -R pi:pi /home/pi/teslacam
cd /home/pi/teslacam

# Make sure we're using the latest version of the teslacam code
git pull

# Install all the node dependencies
npm install
cd src/remote
npm install

echo "TeslaCam Ready!"