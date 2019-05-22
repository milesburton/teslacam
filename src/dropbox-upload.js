#!/bin/node

/* eslint no-await-in-loop: 0 */
/* eslint no-constant-condition: 0 */
const fs = require('fs');
const { readdir, stat } = require('fs').promises;
const { benchmark, execSync, sleep, isOnline } = require('./common.js');
const {
  BACKUP_DIR, DROPBOX_UPLOADER, LOCK_FILE_NAME, WAIT_INTERVAL, DELETE_ON_UPLOAD
} = require('../etc/config.js');


const attemptUpload = (filename, opts = { deleteWhenComplete: true, noop: false }) => {
  try {
    execSync(`${DROPBOX_UPLOADER} -s upload ${BACKUP_DIR}/${filename} .`, { bubbleError: true, noop: opts.noop });

    if (opts.deleteWhenComplete) {
      execSync(`rm ${BACKUP_DIR}/${filename}`);
    }

    console.log(`Uploaded ${filename}`);
    return filename;
  } catch (err) {
    console.log(`Failed to upload ${filename}`);
    return false;
  }
};

async function getFiles(dir) {
  const subdirs = await readdir(dir);
  const files = await Promise.all(subdirs.map(async (subdir) => {
    const res = resolve(dir, subdir);
    return (await stat(res)).isDirectory() ? getFiles(res) : res;
  }));
  return Array.prototype.concat(...files);
}

const getVideos = files => files.map(({ name }) => name).filter(f => f.endsWith('mp4'));

const hasLockFile = files => !!files.find(({ name }) => name === LOCK_FILE_NAME);

const uploadVideoFiles = (videos) => {

  if (!videos.length) {
    return [];
  }

  console.log(`Preparing to upload ${videos.length} videos`);
  const uploadedFiles = videos
    .map(f => attemptUpload(f, { deleteWhenComplete: DELETE_ON_UPLOAD, noop: false }))
    .filter(v => v);

  console.log(`Uploaded ${uploadedFiles.length}/${videos.length}`);
  return uploadedFiles;
};

const onlyNewVideos = (uploadHistory, videos, fn) => {
  // Remove videos that do not exist from the history
  const newUploadHistory = uploadHistory.filter(f => videos.find(v => f === v));
  const videosToUpload = videos.filter(v => !newUploadHistory.find(f => f === v));

  const uploadedVideos = fn(videosToUpload);

  return [...newUploadHistory, ...uploadedVideos];
};

const init = async () => {
  console.log('TeslaCam Dropbox Upload daemon');

  let uploadHistory = [];

  while (true) {
    const files = await getFiles(BACKUP_DIR);

    if (isOnline && !hasLockFile(files)) {
      benchmark(() => uploadHistory = onlyNewVideos(uploadHistory, getVideos(files), uploadVideoFiles));
    }

    await sleep(WAIT_INTERVAL);
  }
};

init();
