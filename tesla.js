#!/bin/node

/* eslint no-bitwise: 0 */
/* eslint no-await-in-loop: 0 */

const { execSync } = require('child_process');
const {
  performance: { now },
} = require('perf_hooks');
const fs = require('fs');

const IMAGE_DIR = '/root/teslacam/images';
const BACKUP_DIR = '/root/teslacam/video';
const IMAGE_MOUNT_POINT = '/mnt';
const RECORD_WINDOW_MS = 1 * 60 * 1000;

const sleep = ms => new Promise(r => setTimeout.call(this, r, Math.max(ms, 1)));

const logExec = buffer => console.log(buffer.toString());

const unmount = (imageNum) => {
  console.log(`Unmounting image ${imageNum}`);
  logExec(execSync('modprobe -r g_mass_storage'));
};
const mount = (imageNum) => {
  console.log(`Preparing to mount image ${imageNum}`);
  logExec(
    execSync(`sudo modprobe g_mass_storage file=${IMAGE_DIR}/cam${imageNum} stall=0,0, ro=0,0 removable=1,1`),
  );
};

const mountLocal = (imageNum) => {
  console.log(`Preparing to local mount image ${imageNum}`);
  logExec(execSync(`mount ${IMAGE_DIR}/cam${imageNum} ${IMAGE_MOUNT_POINT}`));
};

const unmountLocal = (imageNum) => {
  console.log(`Preparing to unmount local image ${imageNum}`);

  try {
    logExec(execSync('umount /mnt'));
  } catch (e) {
    console.log('Ignoring error');
  }
};

const fixLocal = (imageNum) => {
  console.log('Attempting to fix image');
  try {
    logExec(execSync(`fsck -a ${IMAGE_DIR}/cam${imageNum}`));
  } catch (error) {
    console.log(
      'Discovered Errors, consuming error message. Hopefully not fatal',
    );
  }
};

const copyLocal = (imageNum) => {
  console.log(
    `Preparing to copy videos from ${IMAGE_MOUNT_POINT}/teslacam to ${BACKUP_DIR} for image ${imageNum}`,
  );

  const files = fs
    .readdirSync(`${IMAGE_MOUNT_POINT}/teslacam`, { withFileTypes: true })
    .filter(f => typeof f === 'string');

  if (files.length > 0) {
    logExec(execSync(`mv ${IMAGE_MOUNT_POINT}/teslacam/* ${BACKUP_DIR}`));
  }
};

const startup = () => {
  console.log('Starting Tesla Sync script');
  unmount('All');
  unmountLocal(0);
};

const waitForVideoFiles = async (minusLagTime = 0) => {
  console.log('Waiting for video files');
  await sleep(RECORD_WINDOW_MS - minusLagTime);
};

const init = () => {
  startup();

  let imageNum = 0;

  mount(imageNum);

  waitForVideoFiles();

  while (true) {
    unmount(imageNum);
    mount(imageNum ^ 1);
    const t0 = now();

    fixLocal(imageNum);
    mountLocal(imageNum);
    copyLocal(imageNum);
    unmountLocal(imageNum);
    const t1 = now();

    const elapsedTimeMs = t1 - t0;
    console.log(`Took ${elapsedTimeMs} milliseconds to move`);

    waitForVideoFiles();

    imageNum ^= 1;
  }
};

init();
