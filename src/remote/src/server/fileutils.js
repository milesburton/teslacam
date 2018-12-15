const fs = require('fs');

const getVideoFiles = (BACKUP_DIR) => {
  try {
    return fs
      .readdirSync(BACKUP_DIR, { withFileTypes: true })
      .filter(f => f.isFile())
      .map(({ name }) => name)
      .filter(n => fs.existsSync(`${BACKUP_DIR}/${n}`))
      .map((n) => {
        const { birthTimeMs = 0, size } = fs.statSync(`${BACKUP_DIR}/${n}`);


        return {
          birthTimeMs,
          size,
          name: n
        };
      }) // https://nodejs.org/api/fs.html#fs_stats_ctime
      .sort((a, b) => b.birthtimeMs - a.birthtimeMs) // new first
      .filter(({ name }) => name.endsWith('mp4'));
  } catch (err) {
    console.log(err);
  }
  console.log('returning nothing');
  return [];
};


module.exports = { getVideoFiles };
