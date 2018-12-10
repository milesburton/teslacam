const IMAGE_DIR = '~/teslacam/images';
const BACKUP_DIR = '~/teslacam/video';
const IMAGE_MOUNT_POINT = '/mnt';
const RECORD_WINDOW_MS = 15 * 60 * 1000;
const DROPBOX_UPLOADER = '~/dropbox_uploader.sh';
const LOCK_FILE_NAME = 'lock';
const WAIT_INTERVAL = 30 * 1000;


module.exports = { IMAGE_DIR, BACKUP_DIR, IMAGE_MOUNT_POINT, RECORD_WINDOW_MS, DROPBOX_UPLOADER, LOCK_FILE_NAME, WAIT_INTERVAL };
