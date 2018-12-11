const HOME_PATH = '/home/pi/teslacam';
const IMAGE_DIR = `${HOME_PATH}/images`;
const BACKUP_DIR = `${HOME_PATH}/video`;
const IMAGE_MOUNT_POINT = '/mnt';
const RECORD_WINDOW_MS = 5 * 60 * 1000;
const DROPBOX_UPLOADER = '/home/pi/dropbox_uploader.sh';
const DELETE_ON_UPLOAD = false;
const LOCK_FILE_NAME = 'lock';
const WAIT_INTERVAL = 30 * 1000;


module.exports = { IMAGE_DIR, BACKUP_DIR, IMAGE_MOUNT_POINT, RECORD_WINDOW_MS, DROPBOX_UPLOADER, LOCK_FILE_NAME, WAIT_INTERVAL, HOME_PATH, DELETE_ON_UPLOAD };
