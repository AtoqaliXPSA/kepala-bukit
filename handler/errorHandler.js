const fs = require('fs');

process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED]', reason);
  fs.appendFileSync('error.log', `[${new Date().toISOString()}] ${reason.stack || reason}\n`);
});

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT]', err);
  fs.appendFileSync('error.log', `[${new Date().toISOString()}] ${err.stack}\n`);
});