#!/bin/node

/* eslint no-await-in-loop: 0 */
/* eslint no-constant-condition: 0 */

const fs = require('fs');
const {
  BACKUP_DIR, WAIT_INTERVAL
} = require('../etc/config.js');
const { execSync, sleep } = require('./common.js');

const listOldestVideo = dirPath => fs
  .readdirSync(dirPath, { withFileTypes: true })
  .filter(f => f.isFile())
  .map(({ name }) => name)
  .filter(n => fs.existsSync(`${BACKUP_DIR}/${n}`))
  .map((name) => {
    const { size, birthtimeMs } = fs.statSync(`${BACKUP_DIR}/${name}`);

    return { name, size, birthtimeMs: +birthtimeMs };
  })
  .sort((a, b) => a.birthtimeMs - b.birthtimeMs);

const getFilesystemStats = (path) => {
  const available = +execSync(`df -P ${path}/. | tail -1 | awk '{print $4}'`);
  const used = +execSync(`df -P ${path}/. | tail -1 | awk '{print $3}'`);
  const usedPercent = ((used) * 100);
  const overallocationInBytes = usedPercent / used;

  console.log('available', available);
  console.log('available', available);
  console.log('used', used);
  console.log('usedPercent', usedPercent);
  console.log('overallocationInBytes', overallocationInBytes);

  return { overallocationInBytes };
};

const getVideosToDelete = (minimumDiskSpaceToRecoverInBytes, path) => {
  const videosToDelete = listOldestVideo(path)
    .reduce((acc, v) => {
      if (acc.runningTotal > minimumDiskSpaceToRecoverInBytes) {
        return acc;
      }

      return {
        video: [v, ...acc.video],
        runningTotal: acc.runningTotal + v.size
      };
    }, { video: [], runningTotal: 0 });

  return videosToDelete;
};

const deleteVideo = (...videos) => videos.forEach(({ name: filename }) => {
  execSync(`rm ${BACKUP_DIR}/${filename}`, { noop: true });
});

const init = async () => {
  while (true) {
    const { overallocationInBytes } = getFilesystemStats(BACKUP_DIR);
    const videosToDelete = getVideosToDelete(overallocationInBytes, BACKUP_DIR);
    deleteVideo(...videosToDelete);
    await sleep(WAIT_INTERVAL);
  }
};

init();
