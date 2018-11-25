const IMAGE_DIR = '/root/teslacam/images';
const BACKUP_DIR = '/root/teslacam/video';
const IMAGE_MOUNT_POINT = '/mnt';
const RECORD_WINDOW_MS = 15 * 60 * 1000;
const DROPBOX_UPLOADER = '/root/dropbox_uploader.sh';
const LOCK_FILE_NAME = 'lock';
const WAIT_INTERVAL = 30 * 1000;


module.exports = { IMAGE_DIR, BACKUP_DIR, IMAGE_MOUNT_POINT, RECORD_WINDOW_MS, DROPBOX_UPLOADER, LOCK_FILE_NAME, WAIT_INTERVAL };
