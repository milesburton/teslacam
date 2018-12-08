// Enable/disable dashcam
// .............. dropbox
// Settings
// View camera
// See video

const express = require('express');
const serveIndex = require('serve-index');
const errorhandling = require('errorhandler');
// const {
//     BACKUP_DIR
// } = require('./../../../etc/config.js');
const {getVideoFiles} = require('./fileutils');
const cors = require('cors');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const fs = require('fs');
const {execSync} = require(__dirname + '/../../../common');

const BACKUP_DIR = __dirname + '/../../../../video';

const services = [
    {
        label: 'Dashcam Service',
        type: 'service',
        scriptCheckRunning: 'echo running',         // svok .
        scriptStart: 'echo run',
        scriptStop: 'echo stop',
        state: false
    },
    {
        label: 'Dropbox Service',
        type: 'service',
        scriptCheckRunning: 'echo running',         // svok .
        scriptStart: 'echo run',
        scriptStop: 'echo stop',
        state: false
    },
];

const getServiceStatus = () => services.map((s)=> {

    let isRunning = false;
    try {
        execSync(s.scriptCheckRunning);
        isRunning = true;
    } catch (e) {
        console.log(`Service ${s.label} errored with [${e.toString()}]`);
    }


    return {...s, state: isRunning};
});

setInterval(()=> {
    io.emit('services', getServiceStatus());
}, 5000);

fs.watch(BACKUP_DIR, () => {
    io.emit('video', getVideoFiles(BACKUP_DIR));
});

io.on('connection', function (socket) {
    socket.emit('video', getVideoFiles(BACKUP_DIR));
    socket.emit('services', getServiceStatus());
});

app.use(cors());
app.use(errorhandling());
app.use('/video/', express.static(BACKUP_DIR), serveIndex(BACKUP_DIR));

app.get('/api/video', (req, res) => res.send({videoFiles: getVideoFiles(BACKUP_DIR)}));
server.listen(8080, () => console.log('Listening on port 8080!'));
console.log(__dirname);
