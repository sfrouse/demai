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
      chalk.grey(`STARTING - ${msg}`),
    );
  } else {
    console.log(
      chalk.yellow(`STARTING - ${msg}`),
    );
  }
}

/**
 * Log an Update Message
 * @param {string} msg
 */
export function logUpdate(msg) {
  console.log(
    chalk.grey(`UPDATE - ${msg}`),
  );
}

/**
 * Log an Error Message
 * @param {string} msg
 */
export function logError(msg) {
  console.log(
    chalk.redBright(`ERROR - ${msg}`),
  );
  process.exit(1);
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
      chalk.grey(`DONE - ${msg}`),
    );
  } else {
    console.log(
      chalk.cyan(`DONE - ${msg}\n`),
    );
  }
}