require('dotenv').config();
const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
const connectToDatabase = require('./utils/database');
const { checkCooldown } = require('./helper/cooldownHelper');
require('./utils/cron');
const { ping } = require('./utils/gemini');
const User = require('./models/User');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

/* ---------- Auto push ke Git ---------- */
const { exec } = require('child_process');
if (!fs.existsSync('.git/index.lock')) {
  exec('sh push.sh', (err, stdout, stderr) => {
    if (err) return console.error('❌ Push gagal:', err);
    console.log('✅ Git pushed!');
    console.log(stdout || stderr);
  });
}

/* ---------- Keep Alive ---------- */
require('./keepAlive')(client);

/* ---------- Koleksi Commands ---------- */
client.commands = new Collection();
client.messageCommands = new Collection();
client.cooldowns = new Collection();

/* ---------- Load Slash Commands ---------- */
const slashPath = path.join(__dirname, 'commands', 'slash');
fs.readdirSync(slashPath)
  .filter(f => f.endsWith('.js'))
  .forEach(file => {
    const cmd = require(path.join(slashPath, file));
    if (cmd.data && cmd.execute) client.commands.set(cmd.data.name, cmd);
    else console.warn(`⚠️ Fail slash command tidak lengkap: ${file}`);
  });
console.log(`Loaded ${client.commands.size} slash commands.`);

/* ---------- Load Message Commands ---------- */
const messageCmdPath = path.join(__dirname, 'commands/message');
function loadMessageCommands(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(ent => {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) loadMessageCommands(full);
    else if (ent.name.endsWith('.js')) {
      const cmd = require(full);
      if (cmd.name) client.messageCommands.set(cmd.name, cmd);
    }
  });
}
loadMessageCommands(messageCmdPath);
console.log(`Loaded ${client.messageCommands.size} message commands.`);

/* ---------- Load Events ---------- */
fs.readdirSync(path.join(__dirname, 'events'))
  .filter(f => f.endsWith('.js'))
  .forEach(file => {
    const event = require(`./events/${file}`);
    if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
    else client.on(event.name, (...args) => event.execute(...args, client));
  });

/* ---------- Senarai Message Command (ASCII Box) ---------- */
const cmds = [];                                // <-- fix: declare terlebih dahulu
function scan(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(ent => {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) return scan(full);
    if (ent.name.endsWith('.js')) {
      const cmd = require(full);
      if (cmd.name) cmds.push(cmd.name);
    }
  });
}
scan(messageCmdPath);

if (cmds.length) {
  const longest = Math.max(...cmds.map(c => c.length));
  const line    = '—'.repeat(longest + 4);
  const box     =
        `${line}\n` +
        cmds.map(c => `| ${c.padEnd(longest)} |`).join('\n') +
        `\n${'‾'.repeat(longest + 4)}`;
  console.log(box);                            // Log ke console sahaja
}

/* ---------- Bot Ready ---------- */
client.once(Events.ClientReady, async () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
  await connectToDatabase();
  await ping();

  // Sync slash commands (optional)
  await client.application.commands.set(
    [...client.commands.values()].map(c => c.data)
  );

  client.user.setPresence({
    activities: [{ name: 'over your server 👀', type: 3 }],
    status: 'online',
  });
});

/* ---------- Interaction Handler ---------- */
client.on('interactionCreate', async i => {
  if (!i.isCommand()) return;
  const cmd = client.commands.get(i.commandName);
  if (!cmd) return;
  try {
    await cmd.execute(i);
  } catch (err) {
    console.error(err);
    await i.reply({ content: '❌ Ralat semasa laksana slash command.', ephemeral: true });
  }
});

/* ---------- Message Command + XP ---------- */
client.on(Events.MessageCreate, async msg => {
  if (msg.author.bot || !msg.guild) return;

  // XP system
  const user = await User.findOneAndUpdate(
    { userId: msg.author.id },
    { $inc: { xp: 1 } },
    { upsert: true, new: true },
  );
  const xpNeed = Math.floor(50 * user.level + 100);
  if (user.xp >= xpNeed) {
    user.level += 1;
    user.xp = 0;
    await user.save();
    msg.channel.send(`🎉 Tahniah ${msg.author}, naik ke Level ${user.level}!`);
  }

  // Message commands
  const prefix = process.env.PREFIX || '!';
  if (!msg.content.startsWith(prefix)) return;
  const args = msg.content.slice(prefix.length).trim().split(/ +/);
  const cmdName = args.shift().toLowerCase();
  const command = client.messageCommands.get(cmdName)
    || [...client.messageCommands.values()].find(c => c.alias?.includes(cmdName));
  if (!command) return;

  if (await checkCooldown(msg, cmdName, command.cooldown || 0)) return;

  try { await command.execute(msg, args, client); }
  catch (err) {
    console.error(`Error in message command '${cmdName}':`, err);
    msg.reply('❌ Ralat semasa laksana arahan.');
  }
});

client.login(process.env.DISCORD_TOKEN);

/* ---------- Global Error Handler ---------- */
process.on('unhandledRejection', reason => {
  console.error('[Unhandled Rejection]', reason);
  fs.appendFileSync('error.log', `[UNHANDLED] ${new Date().toISOString()}\n${reason.stack || reason}\n\n`);
});
process.on('uncaughtException', err => {
  console.error('[Uncaught Exception]', err);
  fs.appendFileSync('error.log', `[UNCAUGHT] ${new Date().toISOString()}\n${err.stack}\n\n`);
});