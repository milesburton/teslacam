#!/usr/bin/node
const fs = require('fs');
const {execSync} = require('./common');
const {HOME_PATH} = require('./../etc/config');

const [path, script, command] = process.argv;

const getServices = dirPath => fs
    .readdirSync(dirPath, { withFileTypes: true})
    .filter(f=>f.isDirectory())
    .map(({ name }) => `${dirPath}/${name}`);


switch(command){

    case 'start':
        getServices('./services')
            .forEach(s=>{
                execSync(`sudo svc -u ${HOME_PATH}/${s}`);
            });
        break;
    case 'stop':
        getServices('./services')
            .forEach(s=>{
                execSync(`sudo svc -d ${HOME_PATH}/${s}`);
            });
        break;
    case 'status':
        getServices('./services')
            .forEach(s=>{
                execSync(`sudo svstat ${HOME_PATH}/${s}`);
            });
        break;
    default:
        console.log('Unknown command. [start|stop|status]')

}
