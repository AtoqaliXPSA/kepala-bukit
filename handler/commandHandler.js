const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

/**
 * Auto-load message & slash commands.
 * @param {Client} client - Discord client
 */
function loadCommands(client) {
  client.commands = new Collection();
  client.slashCommands = new Collection();
  const slashArray = [];

  const commandBasePath = path.join(__dirname, '../commands'); 

  function readCommands(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
      const fullPath = path.join(dir, file.name);

      if (file.isDirectory()) {
        readCommands(fullPath); // Rekursif untuk sub-folder
      } else if (file.isFile() && file.name.endsWith('.js')) {
        const command = require(fullPath);

        // Message Commands
        if (!command.slash && command.name) {
          client.commands.set(command.name, command);
          console.log(`[MESSAGE CMD] Loaded: ${command.name} (${fullPath})`);

          // Alias
          if (Array.isArray(command.alias)) {
            for (const alias of command.alias) {
              client.commands.set(alias, command);
              console.log(`[MESSAGE CMD]   Alias loaded: ${alias} -> ${command.name}`);
            }
          }
        }

        // Slash Commands
        if (command.slash) {
          if (!command.data || !command.data.name) {
            console.warn(`[SLASH CMD] Skipped invalid slash command: ${fullPath}`);
            continue;
          }
          client.slashCommands.set(command.data.name, command);
          slashArray.push(command.data.toJSON());
          console.log(`[SLASH CMD] Loaded: ${command.data.name} (${fullPath})`);
        }
      }
    }
  }

  readCommands(commandsPath);
  return slashArray; // Return array untuk deploy
}

module.exports = { loadCommands };