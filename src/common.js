const { execSync: execSyncNoLogging } = require('child_process');
const {
  performance: { now },
} = require('perf_hooks');


const sleep = async ms => new Promise(r => setTimeout(r, ms));

const execSync = (cmd, opts = { bubbleError: false, noop: false }) => {
  console.log(`Running [${cmd}]`);
  try {
    const buffer = !opts.noop ? execSyncNoLogging(cmd).toString().trim() : '';
    if (buffer) {
      console.log('======================= process');
      console.log(buffer);
      console.log('======================= /process');
      return buffer;
    }
  } catch (err) {
    const buffer = err.stderr.toString().trim();
    console.log(`Process failed: code [${err.status}]`);
    if (buffer) {
      console.log('======================= error');
      console.log(buffer);
      console.log('======================= /error');
    }

    if (opts.bubbleError) {
      throw err;
    }
  }

  return '';
};

const benchmark = (fn) => {
  const t0 = now();
  fn();
  const elapsedTimeMs = now() - t0;
  console.log(`Took ${elapsedTimeMs} milliseconds`);
  return elapsedTimeMs;
};

module.exports = { sleep, execSync, benchmark };
