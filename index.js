require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { loadCommands } = require('./handler/commandHandler');
const { loadEvents } = require('./handler/eventHandler');
const connectToDB = require('./utils/database');
const keepAlive = require('./keepAlive');
const clearCache = require('./utils/clearCache');
require('./handler/errorHandler');
require('./utils/cron');
require('./utils/monitor');




// ────────────────[ SETUP CLIENT ]────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ],
  sweepers: {
    messages: {
      interval: 300, // Setiap 5 minit
      lifetime: 600  // Mesej lebih 10 minit akan dibuang dari cache
    },
    users: {
      interval: 600,
      filter: () => user => !user.bot // buang user bukan bot lepas 10 min
    },
    presences: {
      interval: 600,
      filter: () => presence => false, // buang semua presence (optional)
    },
    guildMembers: {
      interval: 600,
      filter: () => () => true
    }
  }
});

client.collections = {
  commands: new Collection(),
  message: new Collection(),
  slash: new Collection()
};

// ────────────────[ INIT BOT ]────────────────
(async () => {
  try {
    console.log('-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/');
    console.log('🚀 Starting bot...');
    console.log('-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/');

    console.log('[INFO] Connecting to MongoDB...');
    await connectToDB();

    console.log('[INFO] Load commands...');
    const slashArray = loadCommands(client);
    console.log(`[DONE] ${slashArray.length} command loaded.`);

    console.log('[INFO] Load events...');
    loadEvents(client);
    console.log('[DONE] Events succes loaded.');

    console.log('[INFO] start to online website keepAlive...');
    keepAlive(client);
    console.log('[DONE] Website keepAlive is online.');

    console.log('[INFO] Clearning cache...');
    clearCache('commands');
    clearCache('events');
    console.log('[DONE] Cache has been clear.');

    console.log('[INFO] Login to Discord Bot...');
    await client.login(process.env.DISCORD_TOKEN);

    // ───────────────[ SLASH COMMAND DEPLOY ]───────────────
    if (slashArray.length > 0) {
      console.log(`[INFO] Deploying ${slashArray.length} slash command...`);
      const { REST, Routes } = require('discord.js');
      const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
      try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: slashArray });
        console.log(`[DONE] ${slashArray.length} slash commands deployed.`);
      } catch (err) {
        console.error('[SLASH DEPLOY ERROR]', err);
      }
    } else {
      console.log('[WARNING] Nothing slash to deploy.');
    }
    console.log('-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/');
    console.log('[BOT IS READY]');
    console.log('-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/\n');

  } catch (err) {
    console.error('[ERROR] Bot init gagal:', err);
  }
})();