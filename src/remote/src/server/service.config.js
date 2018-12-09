const services = [
    {
        label: 'Dashcam Service',
        type: 'service',
        scriptCheckRunning: 'svok /root/teslacam/services/dashcam-monitor',
        scriptStart: 'svc -u /root/teslacam/services/dashcam-monitor',
        scriptStop: 'svc -d /root/teslacam/services/dashcam-monitor',
        state: false
    },
    {
        label: 'Dropbox Service',
        type: 'service',
        scriptCheckRunning: 'svok /root/teslacam/services/dropbox-upload',
        scriptStart: 'svc -u /root/teslacam/services/dropbox-upload',
        scriptStop: 'svc -d /root/teslacam/services/dropbox-upload',
        state: false
    },
];

module.exports = {services};