const { execSync: execSyncNoLogging } = require('child_process');
const {
  performance: { now },
} = require('perf_hooks');

const sleep = async ms => new Promise(r => setTimeout(r, ms));

const execSync = (cmd, opts = { bubbleError: false }) => {
  console.log(`Preparing to run command [${cmd}]`);
  try {
    const buffer = execSyncNoLogging(cmd);

    console.log('======================= process');
    console.log(buffer.toString());
    console.log('======================= /process');
  } catch (err) {
    console.log('======================= error');
    console.log(JSON.stringify(err));
    console.log('======================= /error');

    if (opts.bubbleError) {
      throw err;
    }
  }
};

const benchmark = (fn) => {
  const t0 = now();
  fn();
  const elapsedTimeMs = now() - t0;
  console.log(`Took ${elapsedTimeMs} milliseconds to move`);
  return elapsedTimeMs;
};

module.exports = { sleep, execSync, benchmark };