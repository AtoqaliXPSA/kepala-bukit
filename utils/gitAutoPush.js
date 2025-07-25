const fs = require('fs');
const { exec } = require('child_process');

function gitAutoPush() {
  if (fs.existsSync('.git/index.lock')) return;
  exec('git diff --quiet || sh push.sh', (err, stdout, stderr) => {
    if (err) return console.warn('Git push error:', err.message);
    if (stdout || stderr) console.log(stdout || stderr);
  });
}

module.exports = gitAutoPush;