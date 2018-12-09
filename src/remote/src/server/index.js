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
const {getServiceStatus, toggleService} = require('./service-api');
const {services} = require('./service.config.js');
const {adaptVideoModelToUiVideoModel} = require('./client-model-adapter');
const BACKUP_DIR = __dirname + '/../../../../video';

setInterval(()=> {
    io.emit('services', getServiceStatus());
}, 5000);

fs.watch(BACKUP_DIR, () => {
    io.emit('video', adaptVideoModelToUiVideoModel(getVideoFiles(BACKUP_DIR)));
});

io.on('connection', (socket)=> {
    socket.emit('video', getVideoFiles(BACKUP_DIR));
    socket.emit('services', getServiceStatus());

    socket.on('toggle-service', ({label})=> {
        toggleService(label);
        socket.emit('services', getServiceStatus());
    });
});


app.use(cors());
app.use(errorhandling());
app.use('/video/', express.static(BACKUP_DIR), serveIndex(BACKUP_DIR));

app.get('/api/video', (req, res) => res.send({videoFiles: getVideoFiles(BACKUP_DIR)}));
server.listen(8080, () => console.log('Listening on port 8080!'));
