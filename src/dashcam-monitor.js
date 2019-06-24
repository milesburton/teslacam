#!/bin/node

/* eslint no-bitwise: 0 */
/* eslint no-await-in-loop: 0 */
/* eslint no-constant-condition: 0 */

const fs = require('fs');
const {
  IMAGE_DIR,
  BACKUP_DIR,
  IMAGE_MOUNT_POINT,
  RECORD_WINDOW_MS,
  IMAGE_SIZE_MB,
  PAUSE_RECORDING_ON_WIFI,
  WAIT_INTERVAL,
  USE_SSH
} = require('../etc/config.js');
const {
  benchmark, execSync, sleep, isOnline, getFiles
} = require('./common.js');

const calculatePartitionOffsetForImage = (absoluteFilename) => {
  // Shamelessly taken from @marcone
  const sizeInBytes = +execSync(
    `/sbin/sfdisk -l -o Size -q --bytes ${absoluteFilename} | tail -1`,
    { bubbleError: true }
  );
  const sizeInSectors = +execSync(`/sbin/sfdisk -l -o Sectors -q ${absoluteFilename} | tail -1`, {
    bubbleError: true
  });
  const sectorSize = sizeInBytes / sizeInSectors;
  console.log(`Sector size: ${sectorSize}`);
  const partitionStartSector = +execSync(
    `/sbin/sfdisk -l -o Start -q ${absoluteFilename} | tail -1`,
    { bubbleError: true }
  );
  return partitionStartSector * sectorSize;
};

const unmount = (imageNum) => {
  console.log(`Unmounting image ${imageNum}`);
  execSync('sudo /sbin/modprobe -r g_mass_storage');
};

const mount = (imageNum) => {
  console.log(`Preparing to mount image ${imageNum}`);
  const randomSn = Math.floor(Math.random() * 123456);
  execSync(
    `sudo /sbin/modprobe g_mass_storage file=${IMAGE_DIR}/cam${imageNum} removable=1 ro=0 stall=0 iSerialNumber=${randomSn}`,
    { bubbleError: true }
  );
};

const mountLocal = (imageNum, opts = { mountToDirectory: true }) => {
  console.log(`Preparing to local mount image ${imageNum}`);
  const imagePath = `${IMAGE_DIR}/cam${imageNum}`;
  const loopPath = `/dev/loop${imageNum}`;

  const partitionOffset = calculatePartitionOffsetForImage(`${IMAGE_DIR}/cam${imageNum}`);

  execSync(`sudo /sbin/losetup -o ${partitionOffset} ${loopPath} ${imagePath}`, {
    bubbleError: true
  });

  if (opts.mountToDirectory) {
    execSync(`sudo /bin/mount -o gid=pi,uid=pi ${loopPath} ${IMAGE_MOUNT_POINT}`, {
      bubbleError: true
    });
  }
};

const unmountLocal = (imageNum) => {
  console.log(`Preparing to unmount local image ${imageNum}`);
  execSync(`sudo /bin/umount ${IMAGE_MOUNT_POINT}`);
  execSync(`sudo /sbin/losetup -d /dev/loop${imageNum}`);
};

const fixLocal = (imageNum) => {
  console.log('Attempting to fix image');
  // Required to mount loopback to /dev/loop${imageNum}
  mountLocal(imageNum, { mountToDirectory: false });
  execSync(`sudo /sbin/fsck.vfat -a /dev/loop${imageNum}`);
  unmountLocal(imageNum);
};

const countFilesInDirectory = async dirPath => (await getFiles(dirPath)).length;

// TODO: remove the fs calls here so this works over ssh
const removeErroneousVideos = async dirPath => (await getFiles(dirPath))
  .filter(n => fs.existsSync(n))
  .map((name) => {
    const { size } = fs.statSync(name);
    return { name, size };
  })
  .filter(({ size }) => size < 500000)
  .forEach(({ name, size }) => {
    console.log(`Video ${name} is ${size} bytes. Deleting file`);
    execSync(`rm ${name}`);
  });

const copyLocal = async (imageNum) => {
  console.log(
    `Preparing to copy videos from ${IMAGE_MOUNT_POINT}/TeslaCam to ${BACKUP_DIR} for image ${imageNum}`
  );

  const teslacamPath = `${IMAGE_MOUNT_POINT}/TeslaCam`;

  execSync(`rsync -avh --remove-source-files ${teslacamPath}/ ${BACKUP_DIR}`, {
    bubbleError: true
  });

  // Clean up any empty directories
  execSync(`find ${teslacamPath}/* -type d -delete`);
};

const performSanityCheck = async () => {
  const createIfNotExists = (dirName) => {
    execSync(`mkdir -p ${dirName}`);
  };

  const createImageIfNotExists = (imageNum) => {
    const expectedFilename = `${IMAGE_DIR}/cam${imageNum}`;

    try {
      // TODO: don't use exception handling for this logic
      execSync(`ls ${expectedFilename}`, { bubbleError: true });
    } catch {
      // Image file not found, let us create it
      execSync(`fallocate -l ${IMAGE_SIZE_MB}M ${IMAGE_DIR}/cam${imageNum}`, { bubbleError: true });
      execSync(`echo "type=c" | /sbin/sfdisk ${IMAGE_DIR}/cam${imageNum}`, { bubbleError: true });
      mountLocal(imageNum, { mountToDirectory: false, bubbleError: true });
      execSync(`sudo /sbin/mkfs.vfat /dev/loop${imageNum} -F 32 -I`, { bubbleError: true });
      unmountLocal(imageNum);
    }
  };

  const mountAndCheckUsbImage = async (imageNum) => {
    const teslaCamDirectoryLocal = `${IMAGE_MOUNT_POINT}/TeslaCam`;
    mountLocal(imageNum);
    createIfNotExists(teslaCamDirectoryLocal);
    console.log('Copying files');
    await copyLocal(imageNum);
    unmountLocal(imageNum);
  };

  createIfNotExists(IMAGE_MOUNT_POINT);
  createIfNotExists(IMAGE_DIR);
  createImageIfNotExists(0);
  createImageIfNotExists(1);
  await mountAndCheckUsbImage(0);
  await mountAndCheckUsbImage(1);
};

const startup = async () => {
  console.log('Starting Tesla Sync script');
  unmount('All');
  unmountLocal(0);
  if (!USE_SSH) { // TODO: Remove this check and fix the removal call.
    await removeErroneousVideos(BACKUP_DIR);
  }
  await performSanityCheck();
};

const waitForVideoFiles = async (minusLagTime = 0) => {
  console.log('Waiting for video files');
  await sleep(RECORD_WINDOW_MS - minusLagTime);
};

const processVideo = async (imageNum) => {
  mount(imageNum);

  await waitForVideoFiles();
  unmount(imageNum);
  mount(imageNum ^ 1);

  const elapsedTimeMs = benchmark(async () => {
    fixLocal(imageNum);
    mountLocal(imageNum);
    await copyLocal(imageNum);
    unmountLocal(imageNum);
  });
  await waitForVideoFiles(elapsedTimeMs);
};

const init = async () => {
  await startup();

  let imageNum = 0;

  while (true) {
    if (PAUSE_RECORDING_ON_WIFI && isOnline()) {
      await sleep(WAIT_INTERVAL);
    } else {
      await processVideo(imageNum);
      imageNum ^= 1;
    }
  }
};

init();
