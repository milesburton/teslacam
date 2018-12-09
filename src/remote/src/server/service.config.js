const services = [
    {
        label: 'Dashcam Service',
        type: 'service',
        scriptCheckRunning: 'sudo /usr/bin/svok ~/teslacam/services/dashcam-monitor',
        scriptStart: 'sudo /usr/bin/svc -u ~/teslacam/services/dashcam-monitor',
        scriptStop: 'sudo /usr/bin/svc -d ~/teslacam/services/dashcam-monitor',
        state: false
    },
    {
        label: 'Dropbox Service',
        type: 'service',
        scriptCheckRunning: 'sudo /usr/bin/svok ~/teslacam/services/dropbox-upload',
        scriptStart: 'sudo /usr/bin/svc -u ~/teslacam/services/dropbox-upload',
        scriptStop: 'sudo /usr/bin/svc -d ~/teslacam/services/dropbox-upload',
        state: false
    },
];

module.exports = {services};