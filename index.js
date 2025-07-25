require('dotenv').config();
const { Client, GatewayIntentBits, Events } = require('discord.js');
const connectToDB = require('./utils/database');
const keepAlive = require('./keepAlive');
const { loadCommands } = require('./handler/commandHandler');
const setupMessageHandler = require('./events/messageHandler');
const setupSlashHandler = require('./events/slashHandler');
const gitAutoPush = require('./utils/gitAutoPush');
require('./utils/errorLogger');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ],
});

client.messageCommands = new Map();
client.slashCommands = new Map();
client.cooldowns = new Map();

(async () => {
  try {
    gitAutoPush();
    await connectToDB();
    loadCommands(client);
    setupMessageHandler(client);
    setupSlashHandler(client);
    keepAlive(client);
    await client.login(process.env.DISCORD_TOKEN);
    console.log(`🤖 Bot logged in as ${client.user.tag}`);
  } catch (err) {
    console.error('Bot init failed:', err);
  }
})();