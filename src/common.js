const { execSync: execSyncNoLogging } = require('child_process');
const {
  performance: { now },
} = require('perf_hooks');

const outputShellResult = (preamble, buffer) => {
  const trimmedBuffer = buffer.toString().trim();

  if (!buffer) {
    return '';
  }

  if (buffer.includes('\n')) {
    console.log(`======================= ${preamble}`);
    console.log(trimmedBuffer);
    console.log(`======================= /${preamble}`);
  } else {
    console.log(`${preamble}: ${buffer}`);
  }
  return buffer;
};

const sleep = async ms => new Promise(r => setTimeout(r, ms));

const execSync = (cmd, opts = { bubbleError: false, noop: false }) => {
  console.log(`Running [${cmd}]`);
  try {
    const buffer = !opts.noop ? execSyncNoLogging(cmd) : '';
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
  fn();
  const elapsedTimeMs = now() - t0;
  console.log(`Took ${elapsedTimeMs} milliseconds`);
  return elapsedTimeMs;
};

module.exports = { sleep, execSync, benchmark };
