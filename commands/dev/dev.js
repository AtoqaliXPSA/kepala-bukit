const os = require('os');
const fs = require('fs');
const path = require('path');
const util = require('util');
const User = require('../../models/User');

module.exports = {
  name: 'dev',
  alias: ['developer', 'debug'],
  description: 'Developer tools untuk debug bot',
  cooldown: 3,

  async execute(message, args, client) {
    if (message.author.id !== process.env.DEV_ID) {
      return message.reply('❌ Hanya developer boleh gunakan command ini.');
    }

    const sub = (args.shift() || '').toLowerCase();
    const subCommands = {
      cpu: () => showCPU(message),
      uptime: () => showUptime(message),
      dbstats: () => showDBStats(message),
      cacheclear: () => clearCache(message),
      restart: () => restartBot(message),
      ping: () => showPing(message, client),
      debuglog: () => sendDebugLog(message),
      eval: () => evalCode(message, args.join(' ')),
    };

    return subCommands[sub]?.() || message.reply(
      '**cpu , uptime , dbstats , ping , debuglog , eval**'
    );
  },
};

// ────────── Helper Functions ──────────
function showCPU(message) {
  const mem = process.memoryUsage();
  const total = os.totalmem() / 1024 / 1024;
  const used = mem.rss / 1024 / 1024;
  const load = os.loadavg()[0].toFixed(2);

  return message.reply(
    `**CPU:** ${load}\n**Memory:** ${used.toFixed(2)}MB / ${total.toFixed(2)}MB`
  );
}

function showUptime(message) {
  return message.reply(`**Uptime:** ${formatDuration(process.uptime())}`);
}

async function showDBStats(message) {
  try {
    const users = await User.estimatedDocumentCount();
    message.reply(`**DB Stats:** ${users} users.`);
  } catch {
    message.reply('Gagal dapatkann statistik DB.');
  }
}

async function showPing(message, client) {
  const sent = await message.channel.send('Testing ping...');
  const latency = sent.createdTimestamp - message.createdTimestamp;
  sent.edit(`**Bot:** ${latency}ms | **API:** ${Math.round(client.ws.ping)}ms`);
}

function sendDebugLog(message) {
  const logFile = path.resolve('error.log');
  return fs.existsSync(logFile)
    ? message.reply({ files: [logFile] })
    : message.reply('Tiada error.log ditemui.');
}

function evalCode(message, code) {
  if (!code) return message.reply('Masukkan kod untuk eval.');
  try {
    let result = eval(code);
    if (typeof result !== 'string') result = util.inspect(result);
    message.reply(`\`\`\`js\n${result}\n\`\`\``);
  } catch (err) {
    message.reply(`❌ Error: \`${err.message}\``);
  }
}

function formatDuration(sec) {
  const d = Math.floor(sec / 86400),
        h = Math.floor((sec % 86400) / 3600),
        m = Math.floor((sec % 3600) / 60),
        s = Math.floor(sec % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
}