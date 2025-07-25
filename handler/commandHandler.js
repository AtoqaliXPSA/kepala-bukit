const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');
const chalk = require('chalk'); // Untuk console warna

/**
 * Load semua command dari folder 'commands'
 * @param {Client} client 
 * @returns {Array} Array slash commands untuk deploy
 */
function loadCommands(client) {
  client.messageCommands = new Collection();
  client.slashCommands   = new Collection();

  const commandsPath = path.join(__dirname, '../commands');
  const allFiles = getAllJSFiles(commandsPath);

  const slashArray = [];
  const tableData  = [];

  for (const file of allFiles) {
    try {
      const command = require(file);

      // Validasi: pastikan ada "name"
      if (!command.name) {
        console.warn(chalk.yellow(`[SKIP] Command tiada nama: ${file}`));
        continue;
      }

      // Kalau command ada Slash data
      if (command.data && typeof command.data.toJSON === 'function') {
        client.slashCommands.set(command.data.name, command);
        slashArray.push(command.data.toJSON());
      } else {
        // Kalau message command
        client.messageCommands.set(command.name, command);
      }

      // Untuk table
      tableData.push({
        Name: command.name,
        Alias: command.alias ? command.alias.join(', ') : '-'
      });

    } catch (err) {
      console.error(chalk.red(`[ERROR] Fail load ${file}: ${err.message}`));
    }
  }

  // Log table command valid
  console.log(chalk.cyan(`\n[COMMANDS LOADED]`));
  console.table(tableData);

  // Detect jika tiada slash command
  if (slashArray.length === 0) {
    console.log(chalk.yellow('[WARNING] Tiada slash commands dijumpai!'));
  }

  return slashArray;
}

/**
 * Dapatkan semua file .js secara rekursif
 * @param {string} dir 
 * @returns {string[]}
 */
function getAllJSFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of list) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      results = results.concat(getAllJSFiles(fullPath));
    } else if (file.name.endsWith('.js')) {
      results.push(fullPath);
    }
  }
  return results;
}

module.exports = { loadCommands };