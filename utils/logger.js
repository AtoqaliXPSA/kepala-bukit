const chalk = require('chalk');

function logInfo(msg) {
  console.log(chalk.blue(`[INFO] ${msg}`));
}

function logSuccess(msg) {
  console.log(chalk.green(`[SUCCESS] ${msg}`));
}

function logError(msg) {
  console.log(chalk.red(`[ERROR] ${msg}`));
}

module.exports = { logInfo, logSuccess, logError };