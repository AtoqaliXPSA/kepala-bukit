require('dotenv').config();
const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
const connectToDatabase = require('./utils/database');
const { checkCooldown } = require('./utils/cooldownHelper');
const { handleSpam } = require('./Antisystem/AntiSpam');
const Jimp = require('jimp');
require('./utils/cron');

const User = require('./models/User');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

const { exec } = require('child_process');
exec('sh push.sh', (err, stdout, stderr) => {
  if (err) {
    console.error('❌ Push gagal:', err);
    return;
  }
  console.log('✅ Git pushed!');
  console.log(stdout || stderr);
});

const keepAlive = require('./keepAlive')(client);

client.commands = new Collection();
client.messageCommands = new Collection();
client.cooldowns = new Collection();

// Load Slash Commands
const slashPath = path.join(__dirname, 'commands');
const slashFiles = fs.readdirSync(slashPath).filter(file => file.endsWith('.js'));
for (const file of slashFiles) {
  const command = require(`./commands/${file}`);
  if (command.data && command.data.name) {
    client.commands.set(command.data.name, command);
  }
}

// Load Message Commands
const msgCmdPath = path.join(__dirname, 'commands/message');
const msgCmdFiles = fs.readdirSync(msgCmdPath).filter(file => file.endsWith('.js'));
for (const file of msgCmdFiles) {
  const command = require(`./commands/message/${file}`);
  if (command.name) {
    client.messageCommands.set(command.name, command);
  }
}

// Load Events (once)
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// On Ready
client.once(Events.ClientReady, async () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
  await connectToDatabase();
  client.user.setPresence({
    activities: [{ name: 'over your server 👀', type: 3 }],
    status: 'online',
  });
});

// Slash Command Handler
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  const isCooldown = await checkCooldown(interaction, command.data.name, command.cooldown || 0);
  if (isCooldown) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: '⚠️ Berlaku ralat semasa jalankan arahan.', ephemeral: true });
  }
});

// Message Command Handler + XP
client.on(Events.MessageCreate, async message => {
  if (message.author.bot || !message.guild) return;

  // Auto XP
  const user = await User.findOneAndUpdate(
    { userId: message.author.id },
    { $inc: { xp: 1 } },
    { upsert: true, new: true }
  );

  const xpNeeded = user.level * 100;
  if (user.xp >= xpNeeded) {
    user.level += 1;
    user.xp = 0;
    await user.save();
    message.channel.send(`🎉 Tahniah ${message.author}, anda telah naik ke Level ${user.level}!`);
  }

  // Message command prefix
  const prefix = process.env.PREFIX || '!';
  if (!message.content.startsWith(prefix)) return;
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const cmdName = args.shift().toLowerCase();

  let command = client.messageCommands.get(cmdName) ||
    [...client.messageCommands.values()].find(cmd => cmd.alias?.includes(cmdName));

  if (!command) return;

  const isCooldown = await checkCooldown(message, cmdName, command.cooldown || 0);
  if (isCooldown) return;

  const isSpamming = await handleSpam(message);
  if (isSpamming) return;

  try {
    await command.execute(message, args, client);
  } catch (err) {
    console.error(`❌ Error in message command '${cmdName}':`, err);
    message.reply('⚠️ Berlaku ralat semasa laksana arahan.');
  }
});

client.login(process.env.DISCORD_TOKEN);