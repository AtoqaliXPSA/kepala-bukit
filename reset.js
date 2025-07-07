const { REST, Routes } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const commands = [];

// Fungsi rekursif untuk ambil semua fail dalam folder + subfolder
function getAllCommandFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = `${dir}/${item}`;
    if (fs.statSync(fullPath).isDirectory()) {
      getAllCommandFiles(fullPath, files);
    } else if (fullPath.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  return files;
}

const commandFiles = getAllCommandFiles('./commands/slash');

// Ambil command valid sahaja
for (const file of commandFiles) {
  try {
    const command = require(file);
    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
      console.log(`✅ Loaded: /${command.data.name}`);
    } else {
      console.warn(`⚠️ Tidak lengkap: ${file} (missing data/execute)`);
    }
  } catch (err) {
    console.error(`❌ Gagal load ${file}: ${err.message}`);
  }
}

// Setup REST client
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// Deploy ke global
(async () => {
  try {
    console.log(`🌍 Deploy ${commands.length} slash command global...`);
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log('✅ Selesai deploy global!');
    console.log('⏳ Sila tunggu 1–5 minit untuk command muncul di Discord.');
  } catch (error) {
    console.error('❌ Gagal deploy:', error);
  }
})();