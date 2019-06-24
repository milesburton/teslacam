/* eslint no-await-in-loop: 0 */
/* eslint no-constant-condition: 0 */

const { execSync, sleep, isOnline } = require('./common.js');

const {
  BACKUP_DIR, WAIT_INTERVAL, RSYNC_TARGET, DELETE_ON_UPLOAD
} = require('../etc/config.js');

const init = async () => {
  console.log('TeslaCam rsync upload daemon');
  if (!RSYNC_TARGET) {
    console.error('No RSYNC_TARGET defined');
    await sleep(WAIT_INTERVAL);
    return;
  }

  while (true) {
    if (await isOnline()) {
      execSync(
        `rsync ${
          DELETE_ON_UPLOAD ? '--remove-source-files' : ''
        } -avhe ssh ${BACKUP_DIR} ${RSYNC_TARGET}`
      );
    }

    await sleep(WAIT_INTERVAL);
  }
};

init();
