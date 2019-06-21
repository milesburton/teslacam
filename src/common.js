const { execSync: execSyncNoLogging } = require('child_process');
const { readdir, stat } = require('fs').promises;
const { join } = require('path');
const {
  performance: { now },
} = require('perf_hooks');
const internetAvailable = require('internet-available');

const outputShellResult = (preamble, buffer) => {
  const trimmedBuffer = buffer ? buffer.toString().trim() : '';

  if (!trimmedBuffer) {
    return '';
  }

  if (trimmedBuffer.split('\n').length > 2) {
    console.log(`======================= ${preamble}`);
    console.log(trimmedBuffer);
    console.log(`======================= /${preamble}`);
  } else {
    console.log(`${preamble}: ${trimmedBuffer}`);
  }
  return trimmedBuffer;
};

const sleep = async ms => new Promise(r => setTimeout(r, ms));

const execSync = (cmd, opts = { bubbleError: false, noop: false }) => {
  console.log(`Running ssh [${cmd}]`);

  const useSsh = true; // TODO: grab from config
  const teslacamIp = '192.168.25.176'; // 'dockerhost' // TODO: grab from config
  const actualCommand = useSsh ? `ssh pi@${teslacamIp} "${cmd}"` : cmd;

  try {
    const buffer = !opts.noop ? execSyncNoLogging(actualCommand) : '';
    return outputShellResult('Success', buffer);
  } catch (err) {
    const buffer = err.stderr;
    const result = outputShellResult(`Failed: code [${err.status}]`, buffer);

    if (opts.bubbleError) {
      throw err;
    }
    return result;
  }
};

const benchmark = (fn) => {
  const t0 = now();
  const output = fn();

  const hasSomethingWorthLogging = (output || typeof output === 'object' && output.length);

  if (!hasSomethingWorthLogging) {
    return;
  }

  const elapsedTimeMs = now() - t0;
  console.log(`Took ${elapsedTimeMs} milliseconds`);
  return elapsedTimeMs;
};

const isOnline = async () => {
  try {
    await internetAvailable();
    return true;
  } catch (err) {
    console.log(err.toString());
    return false;
  }
};

async function getFiles(dir) {
  const files = (await readdir(dir)).map(f => join(dir, f));


  const children = await Promise.all(files.map(async (f) => {
    if ((await stat(f)).isDirectory()) {
      return getFiles(f);
    }
    return [f];
  }));

  return children.reduce((acc, c) => ([...acc, ...c]), []);
}

module.exports = {
  sleep, execSync, benchmark, isOnline, getFiles
};
