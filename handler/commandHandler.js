const fs = require('fs');
const path = require('path');
const chalk = require('chalk'); // Untuk warna console

/**
 * Helper: Pad text untuk console table
 */
function pad(text, length = 20) {
  return text.length >= length ? text : text + ' '.repeat(length - text.length);
}

/**
 * Baca semua command dari folder `commands`
 * @param {string} dirPath - Path folder commands
 * @param {Collection} collection - Discord.js Collection untuk simpan command
 * @returns {Array} Senarai command yang berjaya dimuat
 */
function readCommands(dirPath, collection) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const loaded = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      loaded.push(...readCommands(fullPath, collection));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      try {
        const command = require(fullPath);
        if (!command.name) {
          console.warn(chalk.yellow(`[SKIP]`), `${fullPath} tiada "name" property.`);
          continue;
        }
        collection.set(command.name, command);
        loaded.push({ name: command.name, path: fullPath });
      } catch (err) {
        console.error(chalk.red(`[ERROR]`), `Gagal load ${fullPath}:`, err.message);
      }
    }
  }
  return loaded;
}

/**
 * Auto-load semua commands (message & slash)
 * @param {Client} client - Discord Client
 * @returns {Array} Array data untuk Slash Command deploy
 */
function loadCommands(client) {
  const commandsDir = path.join(__dirname, '../commands');

  if (!fs.existsSync(commandsDir)) {
    console.error(chalk.red(`[ERROR]`), `Folder "commands" tidak wujud: ${commandsDir}`);
    return [];
  }

  console.log(chalk.blue.bold(`\n[COMMAND HANDLER] Loading commands dari ${commandsDir}\n`));

  const slashArray = [];
  const resultTable = [];

  const folders = fs.readdirSync(commandsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory());

  for (const folder of folders) {
    const folderPath = path.join(commandsDir, folder.name);
    console.log(chalk.cyan(`[SCAN] Folder: ${folder.name}`));

    const tempCollection = new Map();
    const loaded = readCommands(folderPath, tempCollection);

    loaded.forEach(cmd => {
      resultTable.push({ type: folder.name, name: cmd.name, path: cmd.path });
    });

    // Simpan ikut jenis folder
    if (folder.name.toLowerCase().includes('slash')) {
      tempCollection.forEach(cmd => {
        client.slashCommands.set(cmd.name, cmd);
        if (cmd.data) slashArray.push(cmd.data.toJSON ? cmd.data.toJSON() : cmd.data);
      });
    } else {
      tempCollection.forEach(cmd => client.messageCommands.set(cmd.name, cmd));
    }
  }

  // Papar hasil dalam bentuk table
  console.log(chalk.green.bold(`\n[RESULT] Command List:`));
  console.log(chalk.white('='.repeat(60)));
  console.log(`${chalk.bold('Type'.padEnd(12))} | ${chalk.bold('Command'.padEnd(20))} | Path`);
  console.log(chalk.white('-'.repeat(60)));
  resultTable.forEach(row => {
    console.log(
      `${pad(row.type, 12)} | ${pad(row.name, 20)} | ${row.path}`
    );
  });
  console.log(chalk.white('='.repeat(60)));
  console.log(
    chalk.green(`[INFO] ${client.messageCommands.size} message commands, ${client.slashCommands.size} slash commands loaded.`)
  );

  return slashArray;
}

module.exports = { loadCommands };