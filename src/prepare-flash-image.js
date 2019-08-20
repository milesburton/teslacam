#!/usr/bin/node
const fs = require('fs');
const {
  execSync, getFiles
} = require('./common.js');

/*
  This (hacky) script is designed to prepare a TeslaCam usb image.

  Requirements:
  Linux based distribution

  The following commands are supported. Please note if they are not supplied that function will be skipped.

  This script has to be run as root as we mount the disk image to a directory
 */

const supportedCommands = ['--temporary-directory', '--setup-wifi', '--ssid', '--psk', '--dropbox', '--no-download'];

const BINARY_RASPIAN = 'http://director.downloads.raspberrypi.org/raspbian_lite/images/raspbian_lite-2019-07-12/2019-07-10-raspbian-buster-lite.zip';
const BINARY_NODE = 'https://nodejs.org/dist/v10.16.3/node-v10.16.3-linux-armv6l.tar.xz';

const execSyncOrFail = (cmd)=>execSync(cmd, { bubbleError: true });

const getPartitions = (imagePath) => {
  // Derived from @marcone

  const toNumberArray = commandResult => commandResult.split('\n').map(n => +n);

  const sizeInBytes = toNumberArray(execSyncOrFail(`sfdisk -l -o Size -q --bytes "${imagePath}" | tail -n+2`));
  const sizeInSectors = toNumberArray(execSyncOrFail(`sfdisk -l -o Sectors -q "${imagePath}" | tail -n+2`));
  const partitionStartSector = toNumberArray(execSyncOrFail(`sfdisk -l -o Start -q "${imagePath}" | tail -n+2`));

  console.log(JSON.stringify(sizeInBytes));

  const partitionDetails = sizeInBytes.map((_, i) => ({
    sizeInBytes: sizeInBytes[i],
    sizeInSectors: sizeInSectors[i],
    partitionStartSector: partitionStartSector[i],
    sectorSize: sizeInBytes[i] / sizeInSectors[i],
    partitionOffset: partitionStartSector[i] * (sizeInBytes[i] / sizeInSectors[i]),
    imagePath
  }
  ));

  console.log(partitionDetails);
  return partitionDetails;
};

const mountImage = (partition, mountPoint) => {
  execSyncOrFail(`sudo mount -o loop,offset=${partition.partitionOffset},sizelimit=${partition.sizeInBytes} ${partition.imagePath} ${mountPoint}`);
};

const unmountImage = (mountPoint) => {
  execSync(`sudo umount ${mountPoint}`);
};

const findBinary = async (tempDir, ext) => { // this is stupid, use a regex
  const [filepath] = (await getFiles(tempDir, { recursive: false }))
    .filter(n => fs.existsSync(n) && n.endsWith(ext));

  if (!filepath) {
    throw Error('Could not find binary');
  }
  console.log(`Found image at: [${filepath}]`);

  return filepath;
};

const validateCommand = (commands) => {
  const invalidCommands = commands
    .filter((_, i) => i % 2 === 0)
    .filter(c => !supportedCommands.includes(c))
    .map(c => `Warning, argument ["${c}"] is not supported. Supported commands are: ${JSON.stringify(supportedCommands)}`)
    .join('\n');

  if (invalidCommands) {
    throw Error(invalidCommands);
  }
};


const buildCommandsObject = (commands) => {
  const commandObject = commands.reduce((acc, command, i) => {
    // Is either a value or a unsupported command
    if (!supportedCommands.includes(command)) {
      return acc;
    }

    acc[command] = commands[i + 1];
    return acc;
  }, {});


  console.log(JSON.stringify(commandObject));

  return commandObject;
};

const createRandomText = () => Math.random().toString(36).replace(/[^a-z]+/g, '');

async function init() {
  const [path, script, ...commands] = process.argv;

  validateCommand(commands);
  const commandObject = buildCommandsObject(commands);

  const tempDir = commandObject['--temporary-directory'] || `/tmp/teslacam-${createRandomText()}`;
  const mountPoint = `${tempDir}/mnt`;
  execSyncOrFail(`mkdir -p ${tempDir}`);

  console.log(`Executing from [${tempDir}]`);

  if (!commandObject['--no-download']) {
    console.log('Downloading binaries');
    execSyncOrFail(`wget ${BINARY_NODE} -P ${tempDir}`);
    execSyncOrFail(`wget ${BINARY_RASPIAN} -P ${tempDir} && unzip ${tempDir}/*.zip -d ${tempDir}`);
  }

  console.log('Preparing mount point');
  execSync(`sudo /bin/umount ${mountPoint}`); // Unmount the drive if it exists. This will likely fail.
  execSyncOrFail(`rm -rf ${mountPoint}`);
  execSyncOrFail(`mkdir -p ${mountPoint}`);

  const imagePath = await findBinary(tempDir, 'img');

  const [boot, root] = getPartitions(imagePath);

  console.log('Preparing boot partition');
  unmountImage(mountPoint);
  mountImage(boot, mountPoint);

  console.log('Adding setup flag');
  execSyncOrFail(`touch ${mountPoint}/setup.txt`);

  console.log('Enabling SSH');
  execSyncOrFail(`touch ${mountPoint}/ssh`);
  console.log('Enabling USB OTG for fake thumb drive support');
  execSyncOrFail(`tr -d '\n' < ${mountPoint}/cmdline.txt && sed 's/rootwait//g ${mountPoint}/cmdline.txt`);
  execSyncOrFail(`echo " loop.max_part=31 rootwait modules-load=dwc2,g_mass_storage" >> ${mountPoint}/cmdline.txt`);
  execSyncOrFail(`echo " dtoverlay=dwc2" >> ${mountPoint}/config.txt`);

  if (commandObject['--setup-wifi']) {
    console.log('Adding WIFI config');
    execSyncOrFail(`cat ${__dirname}/../installation/wpa_supplicant.conf | sed 's/%SSID%/${commandObject['--ssid']}/g' | sed 's/%PSK%/${commandObject['--psk']}/g' > ${mountPoint}/wpa_supplicant.conf`);
  }

  unmountImage(mountPoint);
  console.log('/Preparing boot partition');


  console.log('Preparing root partition');
  mountImage(root, mountPoint);

  console.log('Installing Node');
  const nodebinary = await findBinary(tempDir, 'xz');
  execSync(`rm -rf ${mountPoint}/opt/node`);
  execSyncOrFail(`rm -rf ${mountPoint}/opt/node && mkdir  ${mountPoint}/opt/node`);
  execSyncOrFail(`tar xvf ${nodebinary} --strip-components=1 --wildcards -C ${mountPoint}/opt/node node*/`);

  console.log('Preparing for daemontools');
  execSyncOrFail(`rm -rf ${mountPoint}/etc/service && mkdir ${mountPoint}/etc/service`);

  console.log('Installing TeslaCam');
  execSyncOrFail(`rm -rf ${mountPoint}/home/pi/teslacam && git clone https://github.com/milesburton/teslacam.git ${mountPoint}/home/pi/teslacam`);
  execSyncOrFail(`cd ${mountPoint}/home/pi/teslacam && git checkout add-ext4-filesystem`); // Temporary


  if (commandObject['--dropbox']) {
    console.log('Installing Dropbox');
    // Dropbox
    execSyncOrFail(`rm -rf ${mountPoint}/home/pi/Dropbox-Uploader && git clone https://github.com/andreafabrizi/Dropbox-Uploader ${mountPoint}/home/pi/Dropbox-Uploader`);
    execSyncOrFail(`echo "OAUTH_ACCESS_TOKEN=${commandObject['--dropbox']}" > ${mountPoint}/home/pi/.dropbox_uploader`);
  }

  console.log('Configuring rc.local to finalise setup after install');
  // For some reason there's no quick way to insert at n line in bash?!
  const piRclPath = `${mountPoint}/etc/rc.local`;
  const lengthOfRcFile = +execSyncOrFail(`cat ${piRclPath} | wc -l`);
  const teslaCamRclPath = `${__dirname}/../installation/rc.local`;
  execSyncOrFail(` echo "$(head -${lengthOfRcFile - 1} ${piRclPath})$(cat ${teslaCamRclPath})$(tail -n +19 ${piRclPath})" > ${piRclPath}`);

  console.log('/Preparing root partition');
  unmountImage(mountPoint);

  console.log('TeslaCam drive image is now ready to burn to your sdhc card using Etcher or dd');
  console.log(`dd if=${imagePath} of=/dev/sdc`);
}

init();
