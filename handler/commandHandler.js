const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');
const chalk = require('chalk');

function loadCommands(client) {
  client.messageCommands = new Collection();
  client.slashCommands = new Collection();

  const baseCommandsPath = path.join(__dirname, '../commands');
  const allFiles = getAllJSFiles(baseCommandsPath);

  const slashArray = [];
  const tableData = [];

  for (const file of allFiles) {
    try {
      const command = require(file);

      if (command.data && typeof command.data.toJSON === 'function') {
        // Slash command
        client.slashCommands.set(command.data.name, command);
        slashArray.push(command.data.toJSON());
        tableData.push({ Name: chalk.cyan(command.data.name) });

      } else if (command.name && typeof command.execute === 'function') {
        // Message command
        client.messageCommands.set(command.name, command);
        tableData.push({ Name: chalk.blue(command.name) });

      } else {
        console.warn(chalk.yellow(`[SKIP] Bukan command valid: ${file}`));
      }

    } catch (err) {
      console.error(chalk.red(`[ERROR] Gagal load ${file}: ${err.message}`));
    }
  }

  // ── Log table dengan hanya nama ──
  console.log('=======================================');
  console.log(chalk.red('[COMMANDS LOADED]'));
  
  console.log(tableData.map(cmd => `- ${chalk.blue(cmd.Name)}`).join('\n'));
  console.log('=======================================');

  if (slashArray.length === 0) {
    console.log(chalk.yellow('[WARNING] Tiada slash commands dijumpai!'));
  }

  return slashArray;
}

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