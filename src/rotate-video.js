#!/bin/node

/* eslint no-await-in-loop: 0 */
/* eslint no-constant-condition: 0 */

const fs = require('fs');
const {
  BACKUP_DIR, WAIT_INTERVAL, MAX_DISK_UTILISATION_PERCENT
} = require('../etc/config.js');
const { execSync, sleep } = require('./common.js');

const listOldestVideo = dirPath => fs
  .readdirSync(dirPath, { withFileTypes: true })
  .filter(f => f.isFile())
  .map(({ name }) => name)
  .filter(n => n.endsWith('.mp4'))
  .filter(n => fs.existsSync(`${BACKUP_DIR}/${n}`))
  .map((name) => {
    const { size, birthtimeMs } = fs.statSync(`${BACKUP_DIR}/${name}`);
    return { name, size, birthtimeMs: +birthtimeMs };
  })
  .sort((a, b) => a.birthtimeMs - b.birthtimeMs);

const getFilesystemStats = (path) => {
  const desiredMaxUtilisation = MAX_DISK_UTILISATION_PERCENT;
  const capacity = +execSync(`df -P ${path}/. | tail -1 | awk '{print $2}'`) * 1024;
  const used = +execSync(`df -P ${path}/. | tail -1 | awk '{print $3}'`) * 1024;
  const usedPercent = used / capacity;
  const overallocationInBytes = Math.max(0, (usedPercent - desiredMaxUtilisation) * capacity);

  console.log('Used %', usedPercent.toFixed(2));
  console.log('Capacity Gb', (capacity / 1024 / 1024 / 1024).toFixed(2));
  console.log('Desired Max Utilisation Gb', ((desiredMaxUtilisation * capacity) / 1024 / 1024 / 1024).toFixed(2));
  console.log('Actual Utilisation Gb', (used / 1024 / 1024 / 1024).toFixed(2));
  console.log('Overallocation Mb', (overallocationInBytes / 1024 / 1014).toFixed(2));

  return { overallocationInBytes };
};

const getVideosToDelete = (minimumDiskSpaceToRecoverInBytes, path) => {
  if (!minimumDiskSpaceToRecoverInBytes) {
    return [];
  }

  const { video: videosToDelete, runningTotal } = listOldestVideo(path)
    .reduce((acc, v) => {
      if (acc.runningTotal > minimumDiskSpaceToRecoverInBytes) {
        return acc;
      }

      return {
        video: [v, ...acc.video],
        runningTotal: acc.runningTotal + v.size
      };
    }, { video: [], runningTotal: 0 });

  console.log(`Found ${videosToDelete.length} to remove. Total size ${(runningTotal / 1024 / 1024).toFixed()}Mb`);

  return videosToDelete;
};

const deleteVideo = (...videos) => videos.forEach(({ name: filename }) => {
  execSync(`rm ${BACKUP_DIR}/${filename}`);
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
