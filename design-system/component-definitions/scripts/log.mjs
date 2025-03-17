import chalk from 'chalk';

/**
 * Log a Start Message
 * @param {string} msg
 * @param {boolean} subprocess
 */
export function logStart(
  msg,
  subprocess = false,
) {
  if (subprocess) {
    console.log(
      chalk.grey(`START - ${msg}`),
    );
  } else {
    console.log(
      chalk.yellow(`START - ${msg}`),
    );
  }
}

/**
 * Log an Update Message
 * @param {string} msg
 */
export function logUpdate(msg) {
  console.log(
    chalk.grey(`UPDTE - ${msg}`),
  );
}

/**
 * Log an Error Message
 * @param {string} msg
 */
export function logError(msg, fail = true) {
  console.log(
    chalk.redBright(`ERROR - ${msg}`),
  );
  if (fail) process.exit(1);
}

/**
 * Log a Done Message
 * @param {string} msg
 * @param {boolean} subprocess
 */
export function logDone(
  msg,
  subprocess = false,
) {
  if (subprocess) {
    console.log(
      chalk.grey(`ENDED - ${msg}`),
    );
  } else {
    console.log(
      chalk.cyan(`ENDED - ${msg}\n`),
    );
  }
}