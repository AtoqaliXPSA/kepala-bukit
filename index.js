require('dotenv').config();
const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
const connectToDatabase = require('./utils/database');
const { checkCooldown } = require('./utils/cooldownHelper');
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
const msgCmdRoot = path.join(__dirname, 'commands');
const msgCmdFiles = [];

function readCommandsRecursively(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      readCommandsRecursively(fullPath); // rekursif
    } else if (file.endsWith('.js')) {
      msgCmdFiles.push(fullPath);
    }
  }
}

readCommandsRecursively(msgCmdRoot);

for (const file of msgCmdFiles) {
  const command = require(file);
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
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;
  const [action, userId] = interaction.customId.split('_');
  if (interaction.user.id !== process.env.ADMIN_ID) return;

  const user = await User.findOne({ userId });
  if (!user) return interaction.reply({ content: '❌ User tidak dijumpai.', ephemeral: true });

  // Modal untuk input jumlah
  const modal = new ModalBuilder()
    .setCustomId(`${action}_modal_${userId}`)
    .setTitle(action.includes('stamina') ? 'Tambah Stamina' : action.includes('add') ? 'Tambah Coins' : 'Tolak Coins');

  const input = new TextInputBuilder()
    .setCustomId('amount')
    .setLabel('Jumlah:')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  modal.addComponents(new ActionRowBuilder().addComponents(input));
  await interaction.showModal(modal);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isModalSubmit()) return;

  const [action, , userId] = interaction.customId.split('_');
  const amount = parseInt(interaction.fields.getTextInputValue('amount'));
  if (isNaN(amount)) return interaction.reply({ content: '❌ Jumlah tidak sah.', ephemeral: true });

  const user = await User.findOne({ userId });
  if (!user) return interaction.reply({ content: '❌ User tidak dijumpai.', ephemeral: true });

  if (action === 'addcoins') user.balance += amount;
  if (action === 'removecoins') user.balance = Math.max(user.balance - amount, 0);
  if (action === 'addstamina') user.stamina = (user.stamina || 0) + amount;

  await user.save();

  await interaction.reply({ content: `✅ ${action} berjaya untuk <@${userId}>.`, ephemeral: true });
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

  try {
    await command.execute(message, args, client);
  } catch (err) {
    console.error(`❌ Error in message command '${cmdName}':`, err);
    message.reply('⚠️ Berlaku ralat semasa laksana arahan.');
  }
});

client.login(process.env.DISCORD_TOKEN);