require('dotenv').config();
const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
const connectToDatabase = require('./utils/database');
const { checkCooldown , setCooldown } = require('./utils/cooldownHelper')
const { handleSpam} = require('./Antisystem/AntiSpam')

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ],
});

const { exec } = require("child_process");

exec("sh push.sh", (err, stdout, stderr) => {
  if (err) {
    console.error("❌ Push gagal:", err);
    return;
  }
  console.log("✅ Git pushed!");
  console.log(stdout || stderr);
});


const keepAlive = require('./keepAlive')(client); // Hidupkan bot

client.commands = new Collection();         // Slash Commands
client.messageCommands = new Collection();  // Message Commands
client.cooldowns = new Collection();        // Cooldowns untuk Slash Commands

// 🔁 Load Slash Commands (commands/*.js)
const slashPath = path.join(__dirname, 'commands');
const slashFiles = fs.readdirSync(slashPath).filter(file => file.endsWith('.js'));

for (const file of slashFiles) {
  const command = require(`./commands/${file}`);
  if (command.data && command.data.name) {
    client.commands.set(command.data.name, command);
  }
}

// 🔁 Load Message Commands (commands/message/*.js)
const msgCmdPath = path.join(__dirname, 'commands/message');
const msgCmdFiles = fs.readdirSync(msgCmdPath).filter(file => file.endsWith('.js'));

for (const file of msgCmdFiles) {
  const command = require(`./commands/message/${file}`);
  if (command.name) {
    client.messageCommands.set(command.name, command);
  }
}

// ✅ Bot Ready
client.once(Events.ClientReady, async () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
  await connectToDatabase(); // Sambung MongoDB

  client.user.setPresence({
    activities: [
      {
        name: 'over your server 👀', // ganti dengan apa saja
        type: 3 // 0 = Playing, 1 = Streaming, 2 = Listening, 3 = Watching, 5 = Competing
      }
    ],
    status: 'online' // online | idle | dnd | invisible
  });
});

// ✅ Slash Command Handler
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  const cooldownEmbed = checkCooldown(command.data.name, interaction.user.id, command.cooldown || 0);
  if (cooldownEmbed) {
    return interaction.reply({ embeds: [cooldownEmbed], flags: 64 });
  }

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    await interaction.reply({
      content: '⚠️ Berlaku ralat semasa jalankan arahan.',
      ephemeral: true
    });
  }
});

// ✅ Message Command Handler
client.on(Events.MessageCreate, async message => {
  if (message.author.bot || !message.guild ) return;

  const prefix = process.env.PREFIX || '!';
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const cmdName = args.shift().toLowerCase();

  // ✅ Dapatkan command dari nama atau alias
  let command = client.messageCommands.get(cmdName);
  if (!command) {
    command = [...client.messageCommands.values()].find(cmd =>
      cmd.alias && cmd.alias.includes(cmdName)
    );
  }

  if (!command) return;

  // ✅ Cooldown check
  const cooldownEmbed = checkCooldown(cmdName, message.author.id, command.cooldown || 0);
  if (cooldownEmbed) {
    return message.reply({ embeds: [cooldownEmbed] });
  }

  // Auto-load event handlers (dalam folder events/)
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

  // ✅ Anti-spam check
  const isSpamming = await handleSpam(message);
  if (isSpamming) return;

  try {
    await command.execute(message, args, client);
  } catch (err) {
    console.error(err);
    message.reply('⚠️ Berlaku ralat semasa laksana arahan.');
  }
});

client.login(process.env.DISCORD_TOKEN);