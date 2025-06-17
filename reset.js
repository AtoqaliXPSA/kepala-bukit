const { REST, Routes } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

// Ambil semua command dalam folder `commands/`
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
  } else {
    console.warn(`⚠️  Command "${file}" tidak lengkap (tiada data atau execute)`);
  }
}

// Setup REST client
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// Deploy ke global
(async () => {
  try {
    console.log(`🌍 Deploy ${commands.length} global command...`);


    console.log("Command yang akan deploy:");
    commands.forEach(cmd => console.log(" - /" + cmd.name));
    
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log('✅ Command berjaya deploy secara global!');
    console.log('⏳ Tunggu 1-5 minit untuk muncul dalam Discord.');
  } catch (error) {
    console.error('❌ Gagal deploy:', error);
  }
})();