const {execSync} = require(__dirname + '/../../../common');
const {services} = require(__dirname + '/service.config');


const getService = (l) => {

    const service = services
        .find(({label})=>label === l);

    return service;
};

const isServiceRunning = (service) => {

    let isRunning = false;
    try {
        execSync(service.scriptCheckRunning, {bubbleError: true});
        isRunning = true;
    } catch (e) {
        console.log(`Service ${service.label} errored with [${e.toString()}]`);
    }

    return isRunning;
};

const getServiceStatus = () => services.map((s)=>({...s, state: isServiceRunning(s)}));

const startService = (s)=>execSync(s.scriptStart);
const stopService = (s)=>execSync(s.scriptStop);

const toggleService = (label) => {
    const s = getService(label);
    isServiceRunning(s) ? stopService(s) : startService(s)
};


module.exports = {getServiceStatus, toggleService};