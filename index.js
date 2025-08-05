require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { loadCommands } = require('./handler/commandHandler');
const { loadEvents } = require('./handler/eventHandler');
const connectToDB = require('./utils/database');
const keepAlive = require('./keepAlive');
const {coolDown} = require('./helper/cooldownHelper');
require('./handler/errorHandler');
const clearCache = require('./utils/clearCache');

// ── Create Discord Client ──
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ],
});

client.commands = new Collection();
client.messageCommands = new Collection();
client.slashCommands = new Collection();


// ── Init Bot ──
(async () => {
  try {
    console.log('Connecting to MongoDB...');
    await connectToDB(); // MongoDB Connect

    console.log('Loading commands...');
    const slashArray = loadCommands(client);

    console.log('Loading events...');
    loadEvents(client);

    console.log('Connect to website...');
    keepAlive(client);

    console.log('Clearing cache...');
    clearCache('commands');
    clearCache('events');



    await client.login(process.env.DISCORD_TOKEN);

    // Deploy slash commands jika ada
    if (slashArray.length > 0) {
      const { REST, Routes } = require('discord.js');
      const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
      try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: slashArray });
        console.log(`✅ ${slashArray.length} slash commands deployed.`);
      } catch (err) {
        console.error('[SLASH DEPLOY ERROR]', err);
      }
    } else {
      console.log('⚠️ Tiada slash commands untuk deploy.');
    }

  } catch (err) {
    console.error('❌ Bot init failed:', err);
  }
})();