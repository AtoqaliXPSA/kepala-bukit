const pidusage = require('pidusage');
const chalk = require('chalk');
const { exec } = require('child_process');

const MAX_CPU = 90;     // % CPU
const MAX_RAM = 300;    // RAM dalam MB

function restartBot() {
  console.log(chalk.bgRed.white('[RESTARTING] Bot sedang dimulakan semula kerana overload...'));

  // Restart current Node process
  exec('pm2 restart bot', (err, stdout, stderr) => {
    if (err) {
      console.error(chalk.red('[RESTART ERROR]'), err);
      return;
    }
    console.log(chalk.green('[SUCCESS] Bot berjaya dimulakan semula.'));
    console.log(stdout);
  });
}

function startMonitoring() {
  setInterval(async () => {
    try {
      const stats = await pidusage(process.pid);
      const cpu = stats.cpu.toFixed(1);
      const ram = (stats.memory / 1024 / 1024).toFixed(1);
      const uptime = (stats.elapsed / 1000).toFixed(0);

      console.log(
        chalk.cyan('[🔍 MONITOR]'),
        chalk.yellow(`CPU: ${cpu}%`),
        chalk.green(`RAM: ${ram} MB`),
        chalk.gray(`Uptime: ${uptime}s`)
      );

      if (cpu > MAX_CPU || ram > MAX_RAM) {
        console.warn(chalk.red(`[⚠️ BOT OVERLOAD] CPU: ${cpu}% | RAM: ${ram}MB`));
        restartBot();
      }

    } catch (err) {
      console.error(chalk.red('[MONITOR ERROR]'), err);
    }
  }, 60000); // setiap 60 saat
}

module.exports = startMonitoring;