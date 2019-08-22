
# The purpose of the post install is to clean up any final installation steps that could not be (easily) done when the disk image was being baked


# Update the pi to the latest dependencies
apt update
apt upgrade -y

# Install daemon tools to keep the scripts alive
apt install -y daemontools daemontools-run git

# Symlink node so it is on the $PATH
ln -s /opt/node/bin/* /usr/bin

# Setup services
ln -s /home/pi/teslacam/services/* /etc/service
find /home/pi/teslacam -name run -exec chmod 755 {} \;


# Setup the teslacam folder and make sure everything is installed.
chown -R pi:pi /home/pi/teslacam
cd /home/pi/teslacam

# Make sure we're using the latest version of the teslacam code
git pull

# Install all the node dependencies
npm install
cd src/remote
npm install

# Enable OTG
sed -i 's/rootwait/loop.max_part=31 rootwait/g' /boot/cmdline.txt
sed -i 's/rootwait/rootwait modules-load=dwc2,g_mass_storage /g' /boot/cmdline.txt
tr -d '\\n' < /boot/cmdline.txt`
echo " dtoverlay=dwc2" >> /boot/config.txt`

echo "TeslaCam Ready!"
reboot