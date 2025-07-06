  require('dotenv').config();
  const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');
  const fs = require('fs');
  const path = require('path');
  const connectToDatabase = require('./utils/database');
  const { checkCooldown } = require('./utils/cooldownHelper');
  const Jimp = require('jimp');
  require('./utils/cron');

  const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
  } = require('discord.js');

  const User = require('./models/User');

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildVoiceStates,
    ],
  });

  // Auto push ke Git
  const { exec } = require('child_process');
  exec('sh push.sh', (err, stdout, stderr) => {
    if (err) {
      console.error('❌ Push gagal:', err);
      return;
    }
    console.log('✅ Git pushed!');
    console.log(stdout || stderr);
  });

  // Keep alive (untuk uptime robot hosting)
  const keepAlive = require('./keepAlive')(client);

  // Setup koleksi commands
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
  const messageCommandPath = path.join(__dirname, 'commands/message');
  const messageFiles = fs.readdirSync(messageCommandPath).filter(file => file.endsWith('.js'));
  for (const file of messageFiles) {
    const command = require(path.join(messageCommandPath, file));
    if (command.name) {
      client.messageCommands.set(command.name, command);
    }
  }

  // Load Events
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

  // When bot ready
  client.once(Events.ClientReady, async () => {
    console.log(`🤖 Logged in as ${client.user.tag}`);
    await connectToDatabase();

    // ✅ Optional: Sync slash commands (auto update)
    await client.application.commands.set(
      [...client.commands.values()].map(cmd => cmd.data)
    );

    client.user.setPresence({
      activities: [{ name: 'over your server 👀', type: 3 }],
      status: 'online',
    });
  });

  // Slash Command Interaction
  client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (err) {
        console.error(err);
        await interaction.reply({ content: '❌ Terdapat ralat semasa laksana slash command.', ephemeral: true });
      }
    }
  });

  // Message Command Handler + XP
  client.on(Events.MessageCreate, async message => {
    if (message.author.bot || !message.guild) return;

    // Auto XP system
    const user = await User.findOneAndUpdate(
      { userId: message.author.id },
      { $inc: { xp: 1 } },
      { upsert: true, new: true }
    );

    const xpNeeded = Math.floor(50 * user.level + 100);
    if (user.xp >= xpNeeded) {
      user.level += 1;
      user.xp = 0;
      await user.save();
      message.channel.send(`🎉 Tahniah ${message.author}, anda telah naik ke Level ${user.level}!`);
    }

    // Message Commands
    const prefix = process.env.PREFIX || '!';
    if (!message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();

    const command = client.messageCommands.get(cmdName) ||
      [...client.messageCommands.values()].find(cmd => cmd.alias?.includes(cmdName));

    if (!command) return;

    const isCooldown = await checkCooldown(message, cmdName, command.cooldown || 0);
    if (isCooldown) return;

    try {
      await command.execute(message, args, client);
    } catch (err) {
      console.error(`Error in message command '${cmdName}':`, err);
      message.reply('***Berlaku ralat semasa laksana arahan.***');
    }
  });

  client.login(process.env.DISCORD_TOKEN);