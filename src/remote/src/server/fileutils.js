const fs = require('fs');

const getVideoFiles = (BACKUP_DIR) => {
    try {
        return fs
            .readdirSync(BACKUP_DIR, {withFileTypes: true})
            .filter(f => f.isFile())
            .map(({name}) => name)
            .filter(n => n.endsWith('mp4'))
            .filter(n => fs.existsSync(`${BACKUP_DIR}/${n}`))
            .map((n, idx) => {
                const {size} = fs.statSync(`${BACKUP_DIR}/${n}`);

                const MATCH_TIMESTAMP = /.*-(\d+)-(\d+)-(\d+)_(\d+)-(\d+).mp4/;
                const [ignore, YYYY, mm, DD, HH, MM] = MATCH_TIMESTAMP.exec(n);

                const timestamp = parseInt(YYYY + mm + DD + HH + MM);

                return {
                    timestamp,
                    size,
                    name: n,
                    idx
                };
            })
            .sort((b, a) =>a.timestamp - b.timestamp) // new first

    } catch (err) {
        console.log(err);
    }
    console.log('returning nothing');
    return [];
};


module.exports = {getVideoFiles};
