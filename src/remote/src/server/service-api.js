
const {execSync} = require(__dirname + '/../../../common');
const getServiceStatus = (services) => services.map((s)=> {

    let isRunning = false;
    try {
        execSync(s.scriptCheckRunning);
        isRunning = true;
    } catch (e) {
        console.log(`Service ${s.label} errored with [${e.toString()}]`);
    }


    return {...s, state: isRunning};
});


module.exports = {getServiceStatus};