require('dotenv').config();
const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const { exec } = require('child_process');

const connectToDB = require('./utils/database');
const { checkCooldown } = require('./helper/cooldownHelper');
require('./utils/cron');
const keepAlive = require('./keepAlive');
const User = require('./models/User');

/* ---------- Helper: Load files async ---------- */
async function loadFiles(dir, filter = f => f.endsWith('.js')) {
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  const out = [];
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...await loadFiles(full, filter));
    else if (filter(ent.name)) out.push(full);
  }
  return out;
}

/* ---------- Git Auto-Push (optional) ---------- */
function gitAutoPush() {
  if (fs.existsSync('.git/index.lock')) return;
  exec('git diff --quiet || sh push.sh', (err, stdout, stderr) => {
    if (err) return console.warn('Git push error:', err.message);
    if (stdout || stderr) console.log(stdout || stderr);
  });
}

/* ---------- Discord Client ---------- */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ],
});

client.commands        = new Collection();
client.messageCommands = new Collection();
client.cooldowns       = new Collection();

/* ---------- Loader Functions ---------- */
async function loadSlashCommands() {
  const files = await loadFiles(path.join(__dirname, 'commands/slash'));
  files.forEach(file => {
    const cmd = require(file);
    if (cmd.data && cmd.execute) client.commands.set(cmd.data.name, cmd);
    else console.warn('⚠️ Slash command invalid:', file);
  });
  console.log(`✓ Loaded ${client.commands.size} slash commands.`);
}

async function loadMessageCommands() {
  const files = await loadFiles(path.join(__dirname, 'commands/message'));
  files.forEach(f => {
    const cmd = require(f);
    if (cmd.name) client.messageCommands.set(cmd.name, cmd);
  });
  console.log(`✓ Loaded ${client.messageCommands.size} message commands.`);
}

async function loadEvents() {
  const files = await loadFiles(path.join(__dirname, 'events'));
  files.forEach(f => {
    const ev = require(f);
    const fn = (...a) => ev.execute(...a, client);
    ev.once ? client.once(ev.name, fn) : client.on(ev.name, fn);
  });
}

/* ---------- ASCII Summary (console only) ---------- */
function printAsciiCommands() {
  const names = [...client.messageCommands.keys()];
  const len   = Math.max(...names.map(n => n.length), 4);
  const line  = '—'.repeat(len + 4);
  console.log(
    `${line}\n` +
    names.map(n => `| ${n.padEnd(len)} |`).join('\n') +
    `\n${'‾'.repeat(len + 4)}`
  );
}

/* ---------- Ready Event ---------- */
client.once(Events.ClientReady, async () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
  await connectToDB();

  await client.application.commands.set(
    client.commands.map(cmd => cmd.data)
  );

  client.user.setPresence({
    activities: [{ name: 'over yours /help 👀', type: 3 }],
    status: 'online',
  });
});

/* ---------- Interaction Handler ---------- */
client.on(Events.InteractionCreate, async i => {
  if (!i.isCommand()) return;
  const cmd = client.commands.get(i.commandName);
  if (!cmd) return;
  try { await cmd.execute(i); }
  catch (e) {
    console.error(e);
    i.reply({ content: 'Error executing command.', flags: 64 });
  }
});

/* ---------- Message Handler ---------- */
client.on(Events.MessageCreate, async m => {
  if (m.author.bot || !m.guild) return;

  // XP
  const user = await User.findOneAndUpdate(
    { userId: m.author.id },
    { $inc: { xp: 1 } },
    { upsert: true, new: true },
  );
  const need = Math.floor(50 * user.level + 100);
  if (user.xp >= need) {
    user.level++; user.xp = 0; await user.save();
    m.channel.send(`🎉 ${m.author} naik ke Level ${user.level}!`);
  }

  // prefix commands
  const prefix = process.env.PREFIX || '!';
  if (!m.content.startsWith(prefix)) return;
  const [cmdName, ...args] = m.content.slice(prefix.length).trim().split(/ +/);
  const cmd = client.messageCommands.get(cmdName) ||
              [...client.messageCommands.values()].find(c => c.alias?.includes(cmdName));
  if (!cmd) return;
  if (await checkCooldown(m, cmdName, cmd.cooldown || 0)) return;
  try { await cmd.execute(m, args, client); }
  catch (e) { console.error(e); m.reply('❌ Error.'); }
});

/* ---------- Init ---------- */
(async () => {
  try {
    gitAutoPush();
    keepAlive(client);
    await Promise.all([loadSlashCommands(), loadMessageCommands(), loadEvents()]);
    printAsciiCommands();
    await client.login(process.env.DISCORD_TOKEN);
  } catch (err) {
    console.error('Bot init failed:', err);
  }
})();

/* ---------- Global Error Logs ---------- */
process.on('unhandledRejection', r => {
  console.error('[UNHANDLED]', r);
  fs.appendFileSync('error.log', `[${new Date().toISOString()}] ${r.stack || r}\n`);
});
process.on('uncaughtException', e => {
  console.error('[UNCAUGHT]', e);
  fs.appendFileSync('error.log', `[${new Date().toISOString()}] ${e.stack}\n`);
});