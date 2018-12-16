#!/bin/node

/* eslint no-await-in-loop: 0 */
/* eslint no-constant-condition: 0 */
const internetAvailable = require('internet-available');

const fs = require('fs');
const { benchmark, execSync, sleep } = require('./common.js');
const {
  BACKUP_DIR, DROPBOX_UPLOADER, LOCK_FILE_NAME, WAIT_INTERVAL, DELETE_ON_UPLOAD
} = require('../etc/config.js');

let uploadHistory = [];

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
    execSync(`${DROPBOX_UPLOADER} -s upload ${BACKUP_DIR}/${filename} .`, { bubbleError: true });

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

const getVideos = files => files.map(({ name }) => name).filter(f => f.endsWith('mp4'));

const hasLockFile = files => !!files.find(({ name }) => name === LOCK_FILE_NAME);

const uploadVideoFiles = (videos) => {

  console.log(`Preparing to upload ${videos.length} videos`);
  const uploadedFiles = videos
    .map(f => attemptUpload(f, { deleteWhenComplete: DELETE_ON_UPLOAD }))
    .filter(v => v);

  console.log(`Uploaded ${uploadedFiles.length}/${videos.length}`);
  return uploadedFiles;

};

const onlyNewVideos = (videos)=>(fn)=> {

  uploadHistory = uploadHistory.filter(f=>!videos.find(v=>v===f)); // Remove videos that do not exist from the history
  const videosToUpload = videos
      .filter(v=>!uploadHistory.find(f=>f===v));

  const uploadedVideos = fn(videosToUpload);

  uploadHistory = [...uploadHistory, ...uploadedVideos];

  return uploadedVideos;
};

const init = async () => {
  console.log('TeslaCam Dropbox Upload daemon');

  while (true) {
    const files = fs
      .readdirSync(BACKUP_DIR, { withFileTypes: true });

    if (isOnline && !hasLockFile(files)) {
      console.log('TeslaCam is online and no lock file discovered');

      benchmark(() => onlyNewVideos(getVideos(files))(uploadVideoFiles));
    } else {
      console.log('No internet or lock file discovered. Waiting till next attempt');
    }

    await sleep(WAIT_INTERVAL);
  }
};

init();
