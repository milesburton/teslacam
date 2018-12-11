#!/bin/node

/* eslint no-await-in-loop: 0 */

const internetAvailable = require('internet-available');

const fs = require('fs');
const { benchmark, execSync, sleep } = require('./common.js');
const {
  BACKUP_DIR, DROPBOX_UPLOADER, LOCK_FILE_NAME, WAIT_INTERVAL, DELETE_ON_UPLOAD
} = require('../etc/config.js');


const isOnline = async () => {
  try {
    await internetAvailable();
    return true;
  } catch (err) {
    console.log(err.toString());
    return false;
  }
};

const attemptUpload = (filename, opts = { deleteWhenComplete : true }) => {
  try {
    execSync(`${DROPBOX_UPLOADER} upload -s ${BACKUP_DIR}/${filename} .`, { bubbleError: true });

    if (opts.deleteWhenComplete) {
	    execSync(`rm ${BACKUP_DIR}/${filename}`);
    }

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
  const uploadedFiles = videoFiles.map(f=>attemptUpload(f, {deleteWhenComplete: DELETE_ON_UPLOAD)).filter(v => v);
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
