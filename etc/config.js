/* eslint-disable max-len */
require('dotenv').config();

const HOME_PATH = process.env.HOME_PATH || '/home/pi/teslacam';

// Destructure off of process.env with some default values
const {
  IMAGE_DIR = `${HOME_PATH}/images`,
  BACKUP_DIR = `${HOME_PATH}/video`,
  /*
  File size per minute of footage, 28MiB
  Minutes of recording: 30
  Number of cameras recording: 3
  Disk image size: 30 * 28 * 3= 2520MiB + margin of error
  */
  IMAGE_SIZE_MB = 3072,
  RECORD_WINDOW_MS = 30 * 60 * 1000,
  IMAGE_MOUNT_POINT = '/mnt',
  DROPBOX_UPLOADER = '/home/pi/dropbox_uploader.sh',
  DELETE_ON_UPLOAD = true,
  LOCK_FILE_NAME = 'lock',
  WAIT_INTERVAL = 30 * 1000,
  MAX_DISK_UTILISATION_PERCENT = 0.8,
  USE_SSH = false,
  TESLACAM_IP = '172.17.0.1',
  NUMBER_OF_DAYS_TO_KEEP = 3,
  RSYNC_TARGET,
  /*
  An apparent bug in the Tesla software causes the dashcam to be unmounted whilst the car is not actively powered up
  A reboot is required to restore dashcam functionality, it may be better to simply pause the dashcam whilst parked
  This wont resolve the problem whilst charging away from home.
  */
  PAUSE_RECORDING_ON_WIFI = false
} = process.env;

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
  PAUSE_RECORDING_ON_WIFI,
  USE_SSH,
  TESLACAM_IP,
  RSYNC_TARGET,
  NUMBER_OF_DAYS_TO_KEEP
};
