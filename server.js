// server.js
const { Client, GatewayIntentBits } = require('discord.js');
const keepAlive = require('./keepAlive');

// 1. Setup bot client (jika guna bot)
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

// 2. On ready
client.once('ready', () => {
  console.log(`🤖 Bot ${client.user.tag} is online!`);
});

// 3. Start express server
keepAlive(client); // ← panggil keepAlive dan pass bot client

// 4. Login bot (masukkan token anda jika guna bot)
client.login(process.env.TOKEN); // ← atau hardcoded: client.login('YOUR_TOKEN')