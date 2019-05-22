const HOME_PATH = '/home/pi/teslacam';
const IMAGE_DIR = `${HOME_PATH}/images`;
const BACKUP_DIR = `${HOME_PATH}/video`;

/*
 File size per minute of footage, 28MiB
 Minutes of recording: 30
 Disk image size: 30 * 28 = 840MiB + margin of error
 */
const IMAGE_SIZE_MB = 1024;
const RECORD_WINDOW_MS = 30 * 60 * 1000;
const IMAGE_MOUNT_POINT = '/mnt';
const DROPBOX_UPLOADER = '/home/pi/dropbox_uploader.sh';
const DELETE_ON_UPLOAD = false;
const LOCK_FILE_NAME = 'lock';
const WAIT_INTERVAL = 30 * 1000;
const MAX_DISK_UTILISATION_PERCENT = 0.8;
// An apparent bug in the Tesla software causes the dashcam to be unmounted whilst the car is not actively powered up
// A reboot is required to restore dashcam functionality, it may be better to simply pause the dashcam whilst parked
// This wont resolve the problem whilst charging away from home.
const PAUSE_RECORDING_ON_WIFI = false;

module.exports = {
  IMAGE_DIR,
  BACKUP_DIR,
  IMAGE_SIZE_MB,
  IMAGE_MOUNT_POINT,
  RECORD_WINDOW_MS,
  DROPBOX_UPLOADER,
  LOCK_FILE_NAME,
  WAIT_INTERVAL,
  HOME_PATH,
  DELETE_ON_UPLOAD,
  MAX_DISK_UTILISATION_PERCENT,
  PAUSE_RECORDING_ON_WIFI
};
