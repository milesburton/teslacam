#!/bin/node

/* eslint no-await-in-loop: 0 */
/* eslint no-constant-condition: 0 */

const { BACKUP_DIR, WAIT_INTERVAL, NUMBER_OF_DAYS_TO_KEEP } = require('../etc/config.js');
const { execSync, sleep } = require('./common.js');

const cleanRecentClips = (numberOfDays) => {
  const recentClipsDirectory = `${BACKUP_DIR}/RecentClips`;

  execSync(`find ${recentClipsDirectory} -mtime +${numberOfDays} -type f -delete`);
};

const init = async () => {
  while (true) {
    cleanRecentClips(NUMBER_OF_DAYS_TO_KEEP);
    await sleep(WAIT_INTERVAL);
  }
};

init();
