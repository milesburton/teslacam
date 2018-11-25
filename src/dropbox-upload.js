#!/bin/node

const { benchmark, execSync, sleep } = require('./common.js');
const internetAvailable = require('internet-available');
const { execSync: execSyncNoLogging } = require('child_process');
const {
  performance: { now },
} = require('perf_hooks');

const fs = require('fs');

const BACKUP_DIR = '/root/teslacam/video';
const DROPBOX_UPLOADER = '/root/dropbox_uploader.sh';
const LOCK_FILE_NAME = 'lock';
const WAIT_INTERVAL = 30 * 1000;


const isOnline = async () => {
  try {
    await internetAvailable();
    return true;
  } catch (err) {
    console.log(err.toString());
    return false;
  }
};

const attemptUpload = (filename, opts = { deleteWhenComplete: true }) => {
  try {
    execSync(`${DROPBOX_UPLOADER} upload ${BACKUP_DIR}/${filename} .`, { bubbleError: true });
    execSync(`rm ${BACKUP_DIR}/${filename}`);
    console.log(`Uploaded ${filename}`);
    return true;
  } catch (err) {
    console.log(`Failed to upload ${filename}`);
    return false;
  }
};

const getVideoFileNames = files => files.map(({ name }) => name).filter(f => f.endsWith('mp4'));

const hasLockFile = files => !!files.find(({ name }) => name === LOCK_FILE_NAME);

const uploadVideoFiles = (files) => {
  const videoFiles = getVideoFileNames(files);

  console.log(`Preparing to upload ${videoFiles.length} videos`);
  const uploadedFiles = videoFiles.map(attemptUpload).filter(v => v);
  console.log(`Uploaded ${uploadedFiles.length}/${videoFiles.length}`);
};

const init = async () => {
  console.log('TeslaCam Dropbox Upload daemon');

  while (true) {
    const files = fs
      .readdirSync(BACKUP_DIR, { withFileTypes: true });

    if (isOnline && !hasLockFile(files)) {
      console.log('TeslaCam is online and no lock file discovered');

      benchmark(() => {
        uploadVideoFiles(files);
      });
    } else {
      console.log('No internet or lock file discovered. Waiting till next attempt');
    }

    await sleep(WAIT_INTERVAL);
  }
};

init();
