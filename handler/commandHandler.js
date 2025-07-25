const fs = require('fs');
const path = require('path');

/**
 * Baca semua command dari folder `commands`
 * @param {string} dirPath - Path folder commands
 * @param {Collection} collection - Discord.js Collection untuk simpan command
 */
function readCommands(dirPath, collection) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      // Rekursif untuk folder dalam folder
      readCommands(fullPath, collection);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      try {
        const command = require(fullPath);
        if (!command.name) {
          console.warn(`[SKIP] ${fullPath} tiada "name" property.`);
          continue;
        }
        collection.set(command.name, command);
        console.log(`[LOAD] Command: ${command.name} (${fullPath})`);
      } catch (err) {
        console.error(`[ERROR] Gagal load command ${fullPath}:`, err);
      }
    }
  }
}

/**
 * Auto-load semua commands (message & slash)
 * @param {Client} client - Discord Client
 * @returns {Array} Array data untuk Slash Command deploy
 */
function loadCommands(client) {
  const commandsDir = path.join(__dirname, '../commands');

  if (!fs.existsSync(commandsDir)) {
    console.error(`[ERROR] Folder "commands" tidak wujud: ${commandsDir}`);
    return [];
  }

  console.log(`[COMMAND HANDLER] Loading commands dari ${commandsDir}`);

  const slashArray = [];

  // Loop semua folder dalam commands/
  const folders = fs.readdirSync(commandsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory());

  for (const folder of folders) {
    const folderPath = path.join(commandsDir, folder.name);
    console.log(`\n[SCAN] Folder: ${folder.name}`);

    const tempCollection = new Map(); // Sementara

    readCommands(folderPath, tempCollection);

    // Simpan ke collection ikut jenis folder
    if (folder.name.toLowerCase().includes('slash')) {
      tempCollection.forEach(cmd => {
        client.slashCommands.set(cmd.name, cmd);
        if (cmd.data) slashArray.push(cmd.data.toJSON ? cmd.data.toJSON() : cmd.data);
      });
    } else {
      tempCollection.forEach(cmd => client.messageCommands.set(cmd.name, cmd));
    }
  }

  console.log(`\n[RESULT] ${client.messageCommands.size} message commands, ${client.slashCommands.size} slash commands loaded.`);
  return slashArray;
}

module.exports = { loadCommands };