const { execSync: execSyncNoLogging } = require('child_process');
const {
  performance: { now },
} = require('perf_hooks');

const sleep = async ms => new Promise(r => setTimeout(r, ms));

const execSync = (cmd, opts = { bubbleError: false }) => {
  console.log(`Preparing to run command [${cmd}]`);
  try {
    const buffer = execSyncNoLogging(cmd);

    console.log('Execution result sucess =====');
    console.log(buffer.toString());
    console.log('End =========================');
  } catch (err) {
    console.log('Execution result error ======');
    console.log(err.toString());
    console.log('End =========================');
  }
};

const benchmark = (fn) => {
  const t0 = now();
  fn();
  const elapsedTimeMs = now() - t0;
  console.log(`Took ${elapsedTimeMs} milliseconds to move`);
  return elapsedTimeMs;
};

module.exports = {sleep, execSync, benchmark};
